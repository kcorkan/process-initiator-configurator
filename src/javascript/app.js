Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'button_box', padding: 10},
        {xtype:'container',itemId:'display_box'},
        {xtype:'tsinfolink'}
    ],
    launch: function() {
    	this._displayProcessList();
    },
    _clearDisplay: function(){
    	this.down('#button_box').removeAll();
    	this.down('#display_box').removeAll();
    },
    _addNewProcess: function(){
    	this.logger.log('_addNewProcess');
    	this._displayProcessDetail('');
    },
    _editProcess: function(grid, row){
    	this.logger.log('_editProcess',grid,row);
    },
    _deleteProcess: function(grid, row){
    	this.logger.log('_deleteProcess',grid,row);
    	
    	var process_name = grid.getStore().getAt(row).get('Name');
    	var msg = Ext.String.format("Are you sure you want to delete the process '{0}'?  This action cannot be undone.", process_name);
    	Ext.create('Rally.ui.dialog.ConfirmDialog', {
    	    message: msg,
    	    title: 'Confirm Delete',
    	    confirmLabel: 'Yes, Delete',
    	    listeners: {
    	    	scope: this,
    	        confirm: function(){
    	         this.logger.log('Delete Requested');
    	        }
    	    }
    	});
    },
    /*
     * Functions to display process detail
     */
    _displayProcessDetail: function(process_name){
    	this.logger.log('_displayProcessDetail',process_name);
    	this._clearDisplay(); 
    	var container = this.down('#display_box');
    	
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Process Name (must be unique)'
    	});
    	container.add({
    		xtype: 'rallytextfield',
    		fieldLabel: 'Short Name (used for the button text in the process grid)'
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
            storeConfig: {
                autoLoad: true,
                model:'TypeDefinition',
               filters: filters
            },
            fieldLabel: 'Rally Type:',
            valueField:'TypePath'
        });
    	container.add({
    		xtype: 'rallybutton',
    		text: '+Add Rule',
    		scope: this,
    		handler: this._addRule
    	});
    },
    _populateFieldSelector: function(cb, new_value){
    	
    },
    _addRule: function(){
   	   	dlg = Ext.create('Rally.technicalservices.dialog.ProcessRule', {

    	 	});
  	   	dlg.show();    
  	},
    /*
     * Functions to display the list of processes that can be edited or deleted 
     */
    _displayProcessList: function(){
    	this.logger.log('_displayProcessList');
    	this._clearDisplay(); 
    	
    	this.down('#button_box').add({
    		xtype: 'rallybutton',
    		text: '+Add New',
    		scope: this,
    		handler: this._addNewProcess
    	});
    	
    	this.down('#display_box').add({
    		xtype: 'rallygrid',
    		store: this._fetchProcessStore(),
    		columnCfgs: this._getProcessGridColumnCfgs()
    	});
    },
    _fetchProcessStore: function(){
    	this.logger.log('_fetchProcessStore');
    	var store = Ext.create('Rally.data.custom.Store', {
    	        data: [{
    	        	'Name': 'User Story Blocked Process',
    	        	'ShortName' : 'Block',
    	        	'Type' : 'UserStory',
    	        	'Field':'Blocked'
    	        },{
    	        	'Name': 'Add New Feature',
    	        	'ShortName' : 'AddNew',
    	        	'Type' : 'PortfolioItem/Feature',
    	        	'Field':''
    	        }]
    	    });
    	return store; 
    },
    _getProcessGridColumnCfgs: function(){
    	this.logger.log('_getProcessGridColumnCfgs');
    	var me = this;
    	
      	var columns = [{ 
            text: 'Name',
            dataIndex: 'Name',
            width: 200,
        },{
            text: 'Short Name',
            dataIndex: 'ShortName',
        },{
        	text: 'Type',
        	dataIndex: 'Type'
        },{
        	text: 'Field',
        	dataIndex: 'Field'
        },{
			xtype: 'actioncolumn',
			buttonText: 'Edit',
			buttonCls: 'ts-secondary-button',
			scope: this,
			items: [{
				scope: this,
                handler: function(grid, row, col) {
                	me._editProcess(grid, row);
                }
            }]
		},{
			xtype: 'actioncolumn',
			buttonText: 'Delete',
			buttonCls: 'ts-secondary-button',
			scope: this,
			items: [{
				scope: this,
                handler: function(grid, row, col) {
                	me._deleteProcess(grid, row);
                }
            }]
		}]; 
      	return columns; 
    },
});