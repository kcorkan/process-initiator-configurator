Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'button_box', padding: 10},
        {xtype:'container',itemId:'display_box'},
        {xtype:'tsinfolink'}
    ],
 //   PROCESS_DEFINITION_PREFIX: 'rally.technicalservices.process-initiator.',
    launch: function() {
    	this._displayProcessList();
    },
    _addNewProcess: function(){
    	this.logger.log('_addNewProcess');
   	   	dlg = Ext.create('Rally.technicalservices.dialog.ProcessDefinition', {
   	   		y: 0,
   	   		workspace: this.getContext().getWorkspace(),
 //  	   		PROCESS_DEFINITION_PREFIX: this.PROCESS_DEFINITION_PREFIX,
   	   		modal: true,
   	   		listeners: {
   	   			scope: this,
   	   			processDefinitionUpdated: this._displayProcessList
   	   		}
   	   	});
	   	dlg.show();    
	   	
    },
    _editProcess: function(grid, row){
    	this.logger.log('_editProcess',grid,row);
    	
    	var key = grid.getStore().getAt(row).get('key');
    	var pd = this.processDefinitionCache.get(key);
   	   	dlg = Ext.create('Rally.technicalservices.dialog.ProcessDefinition', {
   	   		y: 0,
   	   		workspace: this.getContext().getWorkspace(),
   	   		processDefinition: pd,
   	   		modal: true,
   	   		listeners: {
   	   			scope: this,
   	   			processDefinitionUpdated: this._displayProcessList
   	   		}
    	   	});
	   	dlg.show();    
	   	
    },
    _deleteProcess: function(grid, row){
    	this.logger.log('_deleteProcess',grid,row);
    	
    	var key = grid.getStore().getAt(row).get('key');
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
    	         this._actuallyDeleteProcess(key);

    	        }
    	    }
    	});
    },
    _actuallyDeleteProcess: function(pref_key){
    	this.logger.log('_actuallyDeleteProcess');
    	Rally.technicalservices.util.PreferenceSaving._cleanPrefs(pref_key,this.getContext().getWorkspace()).then({
    		scope: this, 
    		failure: function(error){
    			alert(error);
    		},
    		success: function() {
   	         this._displayProcessList();
    		}
    	});
    },
    /*
     * Functions to display the list of processes that can be edited or deleted 
     */
    _displayProcessList: function(){
    	this.logger.log('_displayProcessList');
    	this.down('#button_box').removeAll();
    	this.down('#display_box').removeAll();
    	
    	this.down('#button_box').add({
    		xtype: 'rallybutton',
    		text: '+Add New Process',
    		scope: this,
    		handler: this._addNewProcess
    	});
    	this._fetchProcessStore().then({
    		scope: this,
    		success: function(store){
    	    	this.down('#display_box').add({
    	    		xtype: 'rallygrid',
    	    		store: store,
    	    		columnCfgs: this._getProcessGridColumnCfgs()
    	    	});
    		}
    	});
    },
    _fetchProcessStore: function(){
    	var deferred = Ext.create('Deft.Deferred');
    	
    	this.logger.log('_fetchProcessStore');
    	Rally.technicalservices.util.PreferenceSaving.fetchFromJSON(Rally.technicalservices.ProcessDefinition.getProcessDefinitionPrefix(), 
    			this.getContext().getWorkspace()).then({
    		scope: this,
    		success: function(obj){
    			 var keys = obj[0].getKeys();
    			 this.processDefinitionCache = obj[0];
                 var data = [];
                 console.log('cache',this.processDefinitionCache);
                 Ext.each(keys, function(key){
                	 var pd = obj[0].get(key);
                	 data.push({
                		 'key': key,
                		 'Name': pd.processName,
                		 'ShortName': pd.shortName,
                		 'ObjectType': pd.rallyType,
                		 'ProcessType': pd.processType,
                		 'Field': pd.rallyField,
                	 });
                 }, this);
                 
                 var store = Ext.create('Rally.data.custom.Store',{
                     data: data,
                     limit: 'infinity'
                 });
                 deferred.resolve(store);
    		}
    	});
    	return deferred.promise; 
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
        	text: 'Process Type',
        	dataIndex: 'ProcessType'
        },{
        	text: 'Object Type',
        	dataIndex: 'ObjectType'
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