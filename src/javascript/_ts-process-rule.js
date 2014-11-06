Ext.define('Rally.technicalservices.dialog.ProcessRule',{
    extend: 'Rally.ui.dialog.Dialog',
    logger: new Rally.technicalservices.Logger(),
    autoShow: true,
    draggable: true,
    width: 600,
    fieldLabelWidth: 300,
    items: [
            {xtype:'container',itemId:'header_box'},
            {xtype:'container',itemId:'edit_detail_box',layout:{type:'hbox'}},
            {xtype:'container',itemId:'field_detail_box',layout:{type:'hbox'}},
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
    			change: function(cb, newValue){
    				this.rallyType = newValue;
    			}
    		}
        });
    	container.add({
  	    	xtype: 'rallycombobox',
  	    	fieldLabel: 'Rule Type:',
			store: this._getRuleStore(),
		    displayField: 'name',
		    valueField: 'operation',
    		labelWidth: fieldLabelWidth,
    		allowNoEntry: true,
  	    	listeners: {
  	    		scope: this,
  	    		change: function(cb, newValue){
  	    			this.down('#edit_detail_box').removeAll();
 	    			this.down('#field_detail_box').removeAll();
  	    			this[newValue]();
  	    		}
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
    _addNewRule: function(){
    	this.logger.log('_addNewRule');
    	
    	this.down('#field_detail_box').add({
            xtype: 'rallyfieldpicker',
            fieldLabel: 'Select Required Fields',
            itemId: 'required-field-picker',
            modelTypes: [this.rallyType],
            alwaysExpanded: false,
            labelAlign: 'top',
            padding: 10
        });
    	
    	this.down('#field_detail_box').add({
            xtype: 'rallyfieldpicker',
            fieldLabel: 'Select Optional Fields',
            itemId: 'optional-field-picker',
            modelTypes: [this.rallyType],
            alwaysExpanded: false,
            labelAlign: 'top',
            padding: 10

        });
    },
    _editRule: function(){
    	this.logger.log('_editRule');
    	this.down('#header_box').add({
            xtype: 'rallyfieldcombobox',
            model: this.rallyType,
            fieldLabel: 'Trigger Field:',
            itemId: 'trigger-field-combobox',
            scope: this,
            allowNoEntry: true,
            labelWidth: this.fieldLabelWidth,
            listeners:{
            	scope: this,
            	change: this._setTriggerFieldValues
            } 
        });
    	
    },
    _setTriggerFieldValues: function(cb, newValue){
    	this.logger.log('_setTriggerFieldValues', newValue);
    	this.logger.log('_editRule');
    	this.down('#header_box').add({
	        xtype: 'rallyfieldvaluecombobox',
	        itemId: 'trigger-value-combobox',
	        model: this.rallyType,
	        field: newValue,
            labelWidth: this.fieldLabelWidth,
            fieldLabel: 'Trigger Value:'
    	});

    },
    _save: function(){
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