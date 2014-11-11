Ext.override(Rally.ui.combobox.FieldValueComboBox,{
    _populateStore: function() {
        if (!this.field) {
            Ext.Error.raise('field config must be specified when creating a Rally.ui.combobox.FieldValueComboBox');
        }
        if (this.field.attributeDefinition.AttributeType.toLowerCase() == 'boolean'){
        	var store = this.store; 
        	store.loadRawData([{name:"True", value:"true"},{name:"False", value:"false"}]);
            store.fireEvent('load', store, store.getRange(), true);

        } else {
            this._loadStoreValues();        	
        }

    }
});
Ext.override(Ext.grid.column.Action, {

	buttonText: 'myButton',
    defaultRenderer: function(v, meta, record, rowIdx, colIdx, store, view){
    	var me = this,
            prefix = Ext.baseCSSPrefix,
            scope = me.origScope || me,
            items = me.items,
            len = items.length,
            i = 0,
            item, ret, disabled, tooltip;
 
        // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
        // Assign a new variable here, since if we modify "v" it will also modify the arguments collection, meaning
        // we will pass an incorrect value to getClass/getTip
        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        for (; i < len; i++) {
            item = items[i];

            disabled = item.disabled || (item.isDisabled ? item.isDisabled.call(item.scope || scope, view, rowIdx, colIdx, item, record) : false);
            tooltip = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(item.scope || scope, arguments) : null));

            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {

                // Apply our documented default to all items
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [i], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }

       ret += '<button class="' + me.buttonCls + ' ' + prefix + 'action-col-' + String(i) + '">' + me.buttonText + '</button>';     
        }
        return ret;    
    },
});