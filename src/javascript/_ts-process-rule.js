Ext.define('Rally.technicalservices.dialog.ProcessRule',{
    extend: 'Rally.ui.dialog.Dialog',
    logger: new Rally.technicalservices.Logger(),
    autoShow: true,
    draggable: true,
    width: 400,
    constructor: function(config){
         Ext.apply(this,config);
	     
   	     this.title = 'Process Rule Details';
         this.items = this._initializeItems();
         this.callParent(arguments);
    },
    _initializeItems: function(rec){
  	     var items = [];
  	     items.push({xtype:'container',itemId:'message_box'});
  	     items.push({xtype:'container',itemId: 'detail-container'});
  	     items.push({
             xtype     : 'rallybutton',
             text      : 'Save',
             scope: this,
             handler      : this._save
     	});
  	     items.push( {
             xtype     : 'rallybutton',
             text      : 'Cancel',
             scope: this,
             handler      : this._cancel
         });
  	     return items;
    },
    _save: function(){
    	this._cancel();

    },
     _cancel: function(){
    	this.destroy();
    }
});