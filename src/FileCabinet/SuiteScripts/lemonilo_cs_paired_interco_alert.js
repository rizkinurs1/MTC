/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var form = currentRecord.getValue('customform');
        if (form != 145){
            var pairedInterco = currentRecord.getValue('custbody_lis_paired_interco_trans_bill');
            var createdfrom = createdfromBill(currentRecord.id);
            if(!pairedInterco && createdfrom.length > 0){
                window.alert('This Bill Not Paired With Invoice')
            }
        }
        //
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var fieldName = scriptContext.fieldId;

        if(fieldName === 'tranid'){
            var invNumber = currentRecord.getText('tranid');
            // var createdfrom = createdfromBill(currentRecord.id);
            // log.debug('created', createdfrom);
            var form = currentRecord.getValue('customform');
            var idInvoice = searchinvID(invNumber);
            log.debug('idinvoice', idInvoice);
            if(invNumber){
                if(idInvoice.length > 0){
                    if(idInvoice[0].status == 2){ //Status is Approved
                        currentRecord.setValue('custbody_lis_paired_interco_trans_bill', idInvoice[0].internalid);
                    }else{
                        window.alert('Invoice Number: '+invNumber+' Is Not Approved, Please Contact Your Supervisor To Approve it')
                    }
                }else{
                    window.alert('Invoice Number: '+invNumber+' Not Found, Please Input Another One')
                }
            }
        }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var form = currentRecord.getValue('customform');
        var pairedInterco = currentRecord.getValue('custbody_lis_paired_interco_trans_bill');
        if(form != 145){
            if(!pairedInterco){
                window.alert('This Bill is Not Paired Yet, You Can Not Save This Record');
                return false
            }else{
                return true
            }
        }
        return true
    }

    function searchinvID(invNumber){
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
            [
               ["type","anyof","CustInvc"], 
               "AND", 
               ["formulatext: {tranid}","is",invNumber], 
               "AND", 
               ["mainline","is","T"],
               "AND",
               ["createdfrom", "noneof", "@NONE@"],
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({name: "approvalstatus", label: "Approval Status"})
            ]
         });
            var searchResultCount = invoiceSearchObj.runPaged().count;
            log.debug("invoiceSearchObj result count",searchResultCount);
            var resultObj = [];
            invoiceSearchObj.run().each(function(result){
                resultObj.push({
                    'internalid'    :   result.getValue('internalid'),
                    'status'        :   result.getValue('approvalstatus')
                });
                return true;
            });
        return resultObj
    }

    function createdfromBill(idBill){
        var vendorbillSearchObj = search.create({
            type: "vendorbill",
            filters:
            [
               ["type","anyof","VendBill"], 
               "AND", 
               ["mainline","is","T"], 
               "AND", 
               ["createdfrom","noneof","@NONE@"], 
               "AND", 
               ["internalid","anyof",idBill]
            ],
            columns:
            [
               search.createColumn({name: "createdfrom", label: "Created From"}),
            ]
         });
         var searchResultCount = vendorbillSearchObj.runPaged().count;
         log.debug("vendorbillSearchObj result count",searchResultCount);
         var resultObj = [];
         vendorbillSearchObj.run().each(function(result){
            resultObj.push({
                'createdfrom'    :   result.getValue('createdfrom')
            });
            return true;
         });
        return resultObj
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});
