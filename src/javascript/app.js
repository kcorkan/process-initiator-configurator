Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'button_box', padding: 10},
        {xtype:'container',itemId:'grid_box'},
        {xtype:'tsinfolink'}
    ],
    launch: function() {

    	this.down('#button_box').add({
    		xtype: 'rallybutton',
    		text: '+Add New',
    		scope: this,
    		handler: this._addNewProcess
    	});
    	
    	this.down('#grid_box').add({
    		xtype: 'rallygrid',
    		store: this._fetchProcessStore(),
    		columnCfgs: this._getProcessGridColumnCfgs()
    	});
    },
    _addNewProcess: function(){
    	this.logger.log('_addNewProcess');
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
    _editProcess: function(grid, row){
    	this.logger.log('_editProcess',grid,row);
    },
    _deleteProcess: function(grid, row){
    	this.logger.log('_deleteProcess',grid,row);
    }
});