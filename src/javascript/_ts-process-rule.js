Ext.define('Rally.technicalservices.dialog.ProcessRule',{
    extend: 'Rally.ui.dialog.Dialog',
    logger: new Rally.technicalservices.Logger(),
    autoShow: true,
    draggable: true,
    width: 600,
    fieldLabelWidth: 200,
    items: [
            {xtype:'container',itemId:'header_box'},
            {xtype:'container',itemId:'rule_type_detail_box'},
            {xtype:'container',itemId:'button_box',layout:{type:'hbox'}}
            ],
            
    constructor: function(config){
         Ext.apply(this,config);
	     
   	     this.title = 'Process Rule Details';
         this.callParent(arguments);
         this._initializeItems();

    },
    _initializeItems: function(){
    	var container = this.down('#header_box');
    	var fieldLabelWidth = this.fieldLabelWidth; 
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Process Name (must be unique)',
    		labelWidth: fieldLabelWidth
    	});
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Short Name (button text)',
    		labelWidth: fieldLabelWidth
    	});
        var filters = Ext.create('Rally.data.wsapi.Filter',{
            property:'Restorable',
            value: 'true'
        });
        filters = filters.or(Ext.create('Rally.data.wsapi.Filter',{
            property:'Ordinal',
            value: 0
        }));
        container.add({
            xtype:'rallycombobox',
            displayField: 'DisplayName',
            autoExpand: true,
            itemId: 'rally-type',
            storeConfig: {
                autoLoad: true,
                model:'TypeDefinition',
               filters: filters
            },
            fieldLabel: 'Rally Type:',
            valueField:'TypePath',
    		labelWidth: fieldLabelWidth,
    		listeners: {
    			scope: this,
    			change: this._changeRallyType
    		}
        });
    	this.down('#button_box').add({
            xtype     : 'rallybutton',
            text      : 'Save',
            scope: this,
            handler      : this._save
  	    });
  	    this.down('#button_box').add({
            xtype     : 'rallybutton',
            text      : 'Cancel',
            scope: this,
            handler      : this._cancel
  	    });
    },
    _changeRallyType: function(cb, newValue){
    	this.logger.log('_changeRallyType',newValue);
    	
    	this._destroyComponent('#rule-type-combobox');
    	this.down('#rule_type_detail_box').removeAll();

    	this._fetchModelForRallyType(newValue).then({
    		scope: this,
    		success: function(model){
    			
    			this.rallyTypeModel = model;
    	    	this.rallyType = newValue; 
     	    	
    	    	var container = this.down('#header_box');
    	    	container.add({
    	  	    	xtype: 'rallycombobox',
    	  	    	itemId: 'rule-type-combobox',
    	  	    	fieldLabel: 'Rule Type:',
    				store: this._getRuleStore(),
    			    displayField: 'name',
    			    valueField: 'operation',
    	    		labelWidth: this.fieldLabelWidth,
    	    		allowNoEntry: true,
    	  	    	listeners: {
    	  	    		scope: this,
    	  	    		change: function(cb, newValue){
    	  	    			this.down('#rule_type_detail_box').removeAll();
    	  	    			this[newValue]();
    	  	    		}
    	  	    	}
    	  	    });
    		},
    		failure: function(error){
    			alert(error);
    		}
    	});
    },
    _addNewRule: function(){
    	this.logger.log('_addNewRule');
    	var fields = this.rallyTypeModel.getFields();
    	console.log(this.rallyTypeModel);
    	this._createFieldPickers(this.rallyTypeModel.getFields(), true);
    },
    _fetchModelForRallyType: function(rally_type){
    	var deferred = Ext.create('Deft.Deferred');
    	Rally.data.WsapiModelFactory.getModel({
    	    type: rally_type,
    	    success: function(model) {
    	    	deferred.resolve(model);
    	    },
    	    failure: function(){
    	    	deferred.reject('Error retrieving fields from model.');
    	    }
    	});
    	return deferred.promise;
    },
    _getFieldPickerColumns: function(){
     	var columns = [{
            text: 'Required',
            dataIndex: 'Required',
            xtype : 'checkcolumn',
            width: 50
        },{ 
            text: 'Name',
            dataIndex: 'DisplayName',
            flex: 1
		}]; 
      	return columns; 
     },
    _getTriggerFieldStore: function(fields){
    	var forbidden_schemas = ['Artifact','TestFolder','Workspace','Subscription','SchedulableArtifact'
    	                         ,'TestCase','TestCaseResult','HierarchicalRequirement','PortfolioItem-Feature'];
    	var valid_trigger_attribute_types = ['STRING','BOOLEAN','OBJECT','STATE'];
    	
    	var data = []; 
    	Ext.each(fields, function(field){
    		console.log(field);
    		var field_def = field.attributeDefinition;
    		if (field_def) {
    			console.log(field.name,field_def.AttributeType,!field_def.ReadOnly,!field_def.Hidden, field_def.Constrained,Ext.Array.contains(valid_trigger_attribute_types, attribute_type));
         		var attribute_type = field_def.AttributeType; 
         		if (Ext.Array.contains(valid_trigger_attribute_types, attribute_type) && 
         				!field_def.ReadOnly && 
         				!field_def.Hidden &&
         				field_def.Constrained){
         			console.log('madeit');
					data.push({
						'DisplayName': field.displayName, 
						'Name': field.name
					});
        		}
    		}
    	},this);

    	var store = Ext.create('Rally.data.custom.Store', {
            data: data,
            autoLoad: true 
    	});
    	return store;
    	
    },
    _getFieldPickerStore: function(fields, isAddNew){
    	var forbidden_schemas = ['Artifact','TestFolder','Workspace','Subscription','SchedulableArtifact'
    	                         ,'TestCase','TestCaseResult','HierarchicalRequirement','PortfolioItem-Feature'];
    	var forbidden_attribute_types = ['BINARY_DATA','COLLECTION','WEB_LINK'];
    	
    	var data = []; 
    	Ext.each(fields, function(field){
    		var field_def = field.attributeDefinition;
    		console.log(field,field_def);
    		if (field_def) {
         		var attribute_type = field_def.AttributeType; 
         		if ( field_def.ReadOnly || field_def.Hidden || field_def.VisibleOnlyToAdmins ||
         			(attribute_type == 'OBJECT' && Ext.Array.contains(forbidden_schemas, field_def.SchemaType)) ||
         			Ext.Array.contains(forbidden_attribute_types, attribute_type)){
         			this.logger.log('Exclude Field ', field.name, attribute_type);
         		} else {
					data.push({
						'Name': field.name, 
						'DisplayName': field.displayName, 
						'Required': field_def.Required && isAddNew
					});
        		}
    		}
    	},this);

    	var store = Ext.create('Rally.data.custom.Store', {
            data: data,
            autoLoad: true 
    	});
    	return store;
    },
    _createFieldPickers: function(fields, isAddNew){
    	this.logger.log('_createFieldPickers', this.rallyType);
    	
    	var store = this._getFieldPickerStore(fields, isAddNew);
    	var columns = this._getFieldPickerColumns();

    	this._destroyComponent('#field-picker-grid');
    	
    	this.down('#rule_type_detail_box').add({
	         xtype: 'rallygrid',
	         itemId: 'field-picker-grid',
	         columnCfgs: columns,
	         store: store,
	         height: 255,
	         autoScroll: true
    	});
    },
    _destroyComponent: function(name){
    	
    	if (this.down(name)){
    		this.down(name).destroy();
    	}
    },
    _editRule: function(){
    	this.logger.log('_editRule');
    	
    	this._destroyComponent('#trigger-field-combobox');
    	
    	this.down('#rule_type_detail_box').add({
            xtype: 'rallycombobox',
            store: this._getTriggerFieldStore(this.rallyTypeModel.getFields()),
            fieldLabel: 'Trigger Field:',
            itemId: 'trigger-field-combobox',
            scope: this,
            allowNoEntry: true,
            displayField: 'DisplayName',
            valueField: 'Name',
            labelWidth: this.fieldLabelWidth,
            listeners:{
            	scope: this,
            	change: this._setTriggerFieldValues
            } 
        });
    	
    },
    _setTriggerFieldValues: function(cb, newValue){
    	this.logger.log('_setTriggerFieldValues', newValue);
    	
    	this._destroyComponent('#trigger-value-combobox');
    	
    	this.down('#rule_type_detail_box').add({
	        xtype: 'rallyfieldvaluecombobox',
	        itemId: 'trigger-value-combobox',
	        model: this.rallyType,
	        field: newValue,
            labelWidth: this.fieldLabelWidth,
            fieldLabel: 'Trigger Value:',
            listeners: {
            	scope:this,
            	change: function() {this._createFieldPickers(this.rallyTypeModel.getFields(),false);}
            }
    	});
    },
    _save: function(){
    	this.logger.log('_save');
    	//Save the process 
    	
    	this._cancel();
    },
     _cancel: function(){
    	this.destroy();
    },
    _getRuleStore: function(){
		return Ext.create('Rally.data.custom.Store', {
	        data: [{name:'Add New', operation:'_addNewRule'},
	               {name:'Edit', operation:'_editRule'}],
	        autoLoad: true
	    });
    }
});