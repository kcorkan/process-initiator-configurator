Ext.define('Rally.technicalservices.dialog.ProcessDefinition',{
    extend: 'Rally.ui.dialog.Dialog',
    logger: new Rally.technicalservices.Logger(),
    autoShow: true,
    draggable: true,
    width: 600,
    fieldLabelWidth: 200,
    processDefinition: null,
    workspace: null,
    
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
    	
    	if (this.processDefinition == null){
    		this.processDefinition = Ext.create('Rally.technicalservices.ProcessDefinition',{
    			processType: null,
    			rallyType: 'Defect'    			
    		});
    	} else {
    		var pd = this.processDefinition;
    		this.processDefinition = Ext.create('Rally.technicalservices.ProcessDefinition',{},pd);
    	}
    	
    	var container = this.down('#header_box');
    	var fieldLabelWidth = this.fieldLabelWidth; 
    	
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Process Name (must be unique)',
    		itemId: 'process-name-textfield',
    		labelWidth: fieldLabelWidth,
    		value: this.processDefinition.processName
    	});
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Short Name (button text)',
    		itemId: 'short-name-textfield',
    		labelWidth: fieldLabelWidth,
    		value: this.processDefinition.shortName
    	});
        var filters = Ext.create('Rally.data.wsapi.Filter',{
            property:'Restorable',
            value: true
        });
        filters = filters.and(Ext.create('Rally.data.wsapi.Filter',{
            property:'Creatable',
            value: true
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
        this.down('#rally-type').setValue(this.processDefinition.rallyType);
        
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
    	    	this.processDefinition.rallyType = newValue;
     	    	
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
    	  	    			if (newValue) {
        	  	    			this[newValue]();
    	  	    			}
    	  	    		}
    	  	    	},
    	  	    	value: this.processDefinition.processType
    	  	    });
    	    	if (this.processDefinition.isNew()){
        	    	this.down('#rule-type-combobox').setValue('_addNewRule');
    	    	} else {
        	    	this.down('#rule-type-combobox').setValue('_editRule');
    	    	}
    		},
    		failure: function(error){
    			alert(error);
    		}
    	});
    },
    _addNewRule: function(){
    	this.logger.log('_addNewRule');
    	this.processDefinition.processType = 'new';
    	this.processDefinition.rallyField = '';
    	
    	var fields = this.rallyTypeModel.getFields();
    	
    	var current_required_fields = this.processDefinition.getCurrentRequiredFields();
    	this.processDefinition.clearCurrentRequiredFields();
    	this._createFieldPickers(this.rallyTypeModel.getFields(), true,
    			current_required_fields);
    },
    _editRule: function(){
    	this.logger.log('_editRule');
    	this.processDefinition.processType = 'edit';
    	
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
    	this.down('#trigger-field-combobox').setValue(this.processDefinition.rallyField);
    },

    _setTriggerFieldValues: function(cb, newValue){
    	this.logger.log('_setTriggerFieldValues', newValue);
    	
    	this._destroyComponent('#trigger-value-combobox');
    	this.processDefinition.rallyField = newValue;  
    	
    	
    	this.down('#rule_type_detail_box').add({
	        xtype: 'rallyfieldvaluecombobox',
	        itemId: 'trigger-value-combobox',
	        model: this.rallyType,
	        field: newValue,
            labelWidth: this.fieldLabelWidth,
            fieldLabel: 'Trigger Value:',
            listeners: {
            	scope:this,
            	change: function(cb, newValue) {
            	  	var current_required_fields = this.processDefinition.getCurrentRequiredFields(newValue);
            	  	this.processDefinition.clearCurrentRequiredFields(newValue);
             		this._createFieldPickers(this.rallyTypeModel.getFields(),false,
            				current_required_fields);}
            }
    	});

    },
    _requiredFieldChanged: function(row,val){
    	this.logger.log('_requiredFieldChanged',row,val);
    	
    	var pd_key = 'required';
    	if (!this.processDefinition.isNew()) {
    		pd_key = this.down('#trigger-value-combobox').getValue();
    	} 
    	
    	var grid = this.down('#field-picker-grid');
    	var required_field = grid.getStore().getAt(row).get('Name');
    	console.log(row, required_field,grid.getStore().getAt(row).get('Required') );
    	this._setRequiredField(pd_key,required_field,val);
    	
    },
    _setRequiredField: function(key,required_field,is_required){
    	this.logger.log('_setRequiredField (key, required_field, is_required)', key, required_field, is_required);
    	if (this.processDefinition.processDetail == null){
    		this.processDefinition.processDetail = {};
    	}

    	if (this.processDefinition.processDetail[key] == undefined){
    		this.processDefinition.processDetail[key] = [];
    	}
    	if (is_required){
        	if (!Ext.Array.contains(this.processDefinition.processDetail[key], required_field)){
            	this.processDefinition.processDetail[key].push(required_field); 
        	}
    	} else {
    		for (var i=0; i<this.processDefinition.processDetail[key].length; i++){
    			if (this.processDefinition.processDetail[key][i] == required_field){
    				this.processDefinition.processDetail[key].splice(i,1);
    			}
    		}
    	}
    	console.log('setrequiredfield', this.processDefinition);
    },
    _save: function(){
    	this.logger.log('_save');
    	this.processDefinition.processName = this.down('#process-name-textfield').value;
    	this.processDefinition.shortName = this.down('#short-name-textfield').value;

    	var pref_name = Rally.technicalservices.ProcessDefinition.getProcessDefinitionPrefix(this.processDefinition.rallyType) + this.processDefinition.processName;
    	this.setLoading("Saving...");
    	Rally.technicalservices.util.PreferenceSaving.saveAsJSON(pref_name, this.processDefinition, this.workspace).then({
    		scope: this,
    		success: function(){
    	    	this.setLoading(false);
    	    	this._cancel(); //this.fireEvent('processDefinitionUpdated');
    		},
    		failure: function(error){
    			alert('ProcessDefinitionUpdateFailed: ' + error);
    	    	this.setLoading(false);
    			this._cancel();
    		}
    	});
    	//this._cancel();
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
            xtype: 'checkcolumn',
            width: 100,
            listeners: {
            	scope: this,
            	checkchange: function(chkcol, row, checked){
            		this._requiredFieldChanged(row, checked);
            	}
            }
     	},{ 
            text: 'Name',
            dataIndex: 'DisplayName',
            flex: 1
		}]; 
      	return columns; 
     },
     
    _getTriggerFieldStore: function(fields){
    	this.logger.log('_getTriggerFieldStore', fields);
    	var forbidden_schemas = ['Artifact','TestFolder','Workspace','Subscription','SchedulableArtifact'
    	                         ,'TestCase','TestCaseResult','HierarchicalRequirement','PortfolioItem-Feature'];
    	var valid_trigger_attribute_types = ['STRING','BOOLEAN','OBJECT','STATE'];
    	
    	var data = []; 
    	Ext.each(fields, function(field){

    		var field_def = field.attributeDefinition;
    		if (field_def) {
    			console.log(field.name,field_def.AttributeType,!field_def.ReadOnly,!field_def.Hidden, field_def.Constrained,Ext.Array.contains(valid_trigger_attribute_types, attribute_type));
         		var attribute_type = field_def.AttributeType; 
         		if (Ext.Array.contains(valid_trigger_attribute_types, attribute_type) && 
         				!field_def.ReadOnly && 
         				!field_def.Hidden &&
         				(field_def.Constrained || attribute_type == 'BOOLEAN')){

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
    _getFieldPickerStore: function(fields, isAddNew, current_required_fields){
    	this.logger.log('_getFieldPickerStore', fields.length);
    	var forbidden_schemas = ['Artifact','TestFolder','Workspace','Subscription','SchedulableArtifact'
    	                         ,'TestCase','TestCaseResult','HierarchicalRequirement','PortfolioItem-Feature'];
    	var forbidden_attribute_types = ['BINARY_DATA','COLLECTION','WEB_LINK'];
    	
    	var data = []; 
    	Ext.each(fields, function(field){
    		var field_def = field.attributeDefinition;

    		if (field_def) {
         		
    			var attribute_type = field_def.AttributeType; 
         		if ( field_def.ReadOnly || field_def.Hidden || field_def.VisibleOnlyToAdmins ||
         			(attribute_type == 'OBJECT' && Ext.Array.contains(forbidden_schemas, field_def.SchemaType)) ||
         			Ext.Array.contains(forbidden_attribute_types, attribute_type) ||
         			(field.name == this.processDefinition.rallyField)){
         			this.logger.log('Exclude Field ', field.name, attribute_type);
         		} else {
					var required = (Ext.Array.contains(current_required_fields, field.name)) || 
							(field_def.Required && isAddNew)
							
					if (required) {
						this._setRequiredField('required',field.name,true);
					}
					
         			data.push({
						'Name': field.name, 
						'DisplayName': field.displayName, 
						'Required': required
					});
        		}
    		}
    	},this);

    	var store = Ext.create('Rally.data.custom.Store', {
            data: data,
            autoLoad: true,
            pageSize: 500,
            remoteSort: false,
            sorters: [{
            	property: 'Required',
            	direction: 'DESC'
            },{
            	property: 'Name',
            	direction: 'ASC'
            }]
    	});
    	return store;
    },
    _createFieldPickers: function(fields, isAddNew, current_required_fields){
    	this.logger.log('_createFieldPickers', this.rallyType, fields, current_required_fields);
    	
    	var store = this._getFieldPickerStore(fields, isAddNew, current_required_fields);
    	var columns = this._getFieldPickerColumns();
    	var current_required_fields = [];
     	
    	this._destroyComponent('#field-picker-grid');
    	
    	this.down('#rule_type_detail_box').add({
	         xtype: 'rallygrid',
	         itemId: 'field-picker-grid',
	         columnCfgs: columns,
	         store: store,
	         height: 255,
	         autoScroll: true,
	         showPagingToolbar: false,
	         margin: 25
    	});
    },
    _destroyComponent: function(name){
    	if (this.down(name)){
    		this.down(name).destroy();
    	}
    },
});