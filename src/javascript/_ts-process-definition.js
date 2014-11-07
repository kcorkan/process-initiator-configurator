Ext.define('Rally.technicalservices.ProcessDefinition',{
    logger: new Rally.technicalservices.Logger(),
    processName: '',
    shortName: '',
    /*
     * processType:  Type of process this is enforcing:
     * 		-- new  : creation of a new artifact with rules
     * 		-- edit : editing of an existing artifact with rules
     */
    processType: 'edit', //edit is default
    rallyType: '',  //Required
    /*
     * rallyField:  The field that the processDetail rules belong to.  If this is null, then 
     * this process definition applies to new objects.  
     * 
     */
    rallyField: '',
    /*
     * processDetail - current: The rules for this process
     * 
     *    EXAMPLE (edit):
     *    {
     *    	<triggerValue>: ['requiredfield1','requiredfield2',...] 
     *    }
     *    
     *    EXAMPLE (new):
     *    
     *    {
     *    	 required: ['requiredfield1','requiredfield2',...] 
     *    }
     * 
     */
    processDetail: null, 
    /*
     * processDetail - wannabe: The rules for this process
     * 
     *    EXAMPLE:
     *    {
     *    	type:  presence | inclusion* | exclusion* | format*   (*not implemented yet),
     *      field:  the field that the rule is applied to (e.g. FixedInBuild),
     *      triggerValues: [] Array of values that trigger this rule (e.g. ['Fixed', 'Closed'];  If this is empty, then it applies to all objects
     *    }
     * 
     */
 
    constructor: function(config, jsonObject){
        Ext.apply(this,config);
        if (jsonObject){
        	this. processName = jsonObject.processName;
            this.shortName = jsonObject.shortName;
            this.rallyType = jsonObject.rallyType;
            this.rallyField = jsonObject.rallyField;
            this.processType = jsonObject.processType;
            this.processDetail = jsonObject.processDetail;
        }
    },
    isNew: function(){
    	return (this.processType == 'new');
    },
    getCurrentRequiredFields: function(key){
    	if (key == undefined){
    		key = 'required';
    	}
    	if (this.processDetail[key]==undefined){
    		this.processDetail[key]=[];
    	}
    	return this.processDetail[key];
    },
    /*
     * getProcessFields: returns the fields that are defined in all the rules for the current process
     * 
     */
    getProcessFields: function(){
    	var fields = [];
    	if (this.rallyField){
    		fields.push(this.rallyField);
    	}
    	if (this.processDetail == null) {
    		this.processDetail = {};
    	}
    	Ext.each(Object.keys(this.processDetail), function(pdkey){
			Ext.each(this.processDetail[pdkey], function(pdd){
				fields.push(pdd);
			}, this);
		}, this);
    	return fields; 
    },
    
    /*
     * getTriggeredProcessFields: returns the fields that are triggered by for the current value of the process field
     * 
     */
    getTriggeredProcessFields: function(value){
    	if (this.processDetail == null) {
    		this.processDetail = {};
    	}

    	return this.processDetail[value];
    },
    
    validate: function(detail_field, detail_value, trigger_value){
    	this.logger.log('validate',trigger_value,detail_field,detail_value);
    	var req_fields = [];
    	
    	if (this.isNew()){
    		return this._validateNew(detail_field,detail_value);
    	}
    	if (this.processDetail == null) {
    		this.processDetail = {};
    	}
    	
    	if (Ext.Array.contains(Object.keys(this.processDetail), trigger_value.toString())){
        	req_fields = this.processDetail[trigger_value.toString()];
    	} else {
    		req_fields = this.processDetail.required;
    	}
    	if (Ext.Array.contains(req_fields, detail_field)){
    		if (detail_value && detail_value.toString().length > 0){
    			return {valid: true};  
    		}
    	} else {
			return {valid: true};  
    	}
    	var msg = Ext.String.format("A value for field {0} is required when {1} = {2}.", detail_field, this.rallyField, trigger_value);
		return {valid: false, message: msg};  

    },
    _validateNew: function(detail_field, detail_value){
    	if (this.processDetail == null) {
    		this.processDetail = {};
    	}

    	var req_fields = this.processDetail.required;
    	console.log(req_fields,this.processDetail.required, this.processDetail['required']);
    	if (Ext.Array.contains(req_fields, detail_field)){
    		console.log('array contains ', detail_field, detail_value);
    		if (detail_value && detail_value.length > 0){
    			return {valid: true};  
    		}
    	} else {
			return {valid: true};  
    	}
    	var msg = Ext.String.format("A value for field {0} is required for a new {1}.", detail_field, this.rallyType);
		return {valid: false, message: msg};  
    },
    
/*
 * This is just an example of validations in the model object.  
 * Trying to make the processDetail similiar so that someday we may be able to take
 * advantage of this functionality
 * 
 * validations: [
 *	                {type: 'presence',  field: 'age'},
 *                  {type: 'length',    field: 'name',     min: 2},
 *                  {type: 'inclusion', field: 'gender',   list: ['Male', 'Female']},
 *                  {type: 'exclusion', field: 'username', list: ['Admin', 'Operator']},
 *                  {type: 'format',    field: 'username', matcher: /([a-z]+)[0-9]{2,3}/}
 *               ]
 * 
 */ 
    statics: {
        PROCESS_DEFINITION_PREFIX: 'rally.technicalservices.process-initiator.',
        getProcessDefinitionPrefix: function(type){
        	if (type && type.length > 0 ) {
            	return Rally.technicalservices.ProcessDefinition.PROCESS_DEFINITION_PREFIX  + type.toLowerCase() + '.';
       		
        	} else {
            	return Rally.technicalservices.ProcessDefinition.PROCESS_DEFINITION_PREFIX;
        	}
        }
    }
});