/*
* This will get all unique keys from a nested array
*/
function theDigger (obj) {
    
    var theFields = [];

    if (typeof obj == 'object') {
        
        $.each(obj, function (k,v) {

            if (k.indexOf('fn.') === -1) {
                
                if (k.indexOf('this.') === -1) {
                    
                    theFields.push(k);
                }

                if ( (k == 'this.subs') || (typeof v == 'object') ) {

                    theFields = theFields.concat(theDigger(v));
                }
            }

        });

    } else {
        
        console.log("[ERROR]: Variable of type "+typeof obj+" was sent, but expected jQuery or object.");
        return;

    }
    theFields = theFields.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
    return theFields;
}


/*
*  This is the cleanup function, to clear fields as necessary, and is called periodically in stage 1 and 2
*  obj expects a jQuery object, or an array of fieldIDs to clear
*/
function theCleaner (obj) {

    if (typeof obj == 'object') {
        if (obj instanceof jQuery) {
            obj.html('');
        } else {
            $.each(obj, function (k,v) {
                if (v instanceof jQuery) {
                    v.html('');
                } else {
                    $('#'+v).html('');
                }
            });
        }
    } else {
        console.log("[ERROR]: Variable of type "+typeof obj+" was sent, but expected jQuery or object.");
        return;
    }
}

/*
*  Function to check a string to see if we need to eval() it
*  @param {string} val
*  @return {string}
*/
function checkForEval(val) {

    if (!(typeof val == 'string')) {
        console.log("[ERROR]: Variable of type "+typeof val+" found, but expected string.");
        return;
    }

    if (val.indexOf('$') > -1) {
        return(eval(val));
    } else {
        return(val);
    }
}

/*
*  Function to evaluate all of the actions and publish the results
*/
function actionLoop ( actions, dest ) {

    if (typeof dest === 'undefined') {
        console.log("[ERROR]: 'dest' variable not defined but required.");
        return;
    }

    var thePreview = dest.closest('div[data-live-form]');
    var theForm = $('form#'+thePreview.attr('data-form-name'));

    // If we find fn.html we need to run that first
    if ('html' in actions) {
        dest.html(checkForEval(actions['html']));
        delete actions['html'];
    }

    if (Array.isArray(actions)) {
        
        $.each(actions, function(k,v) {
            eval(v);
        });
    } else {

        $.each(actions, function (k,v) {

            var args = {};

            if (typeof v == 'string') {
                args = checkForEval(v);
            } else {
                $.each(v, function (key,val) {
                    args[key] = checkForEval(val);
                });
            }

            dest[k](args);
        });
    }

    if ($('#live-form-preview').hasClass('closed')) {
        $('#live-preview-title').addClass('updates');
    }
}

/*
*  This should sort through rules in prep for actions
*  rules: Should be a valid ruleset as scoped in stage 2
*  dest: Expects a jQuery object
*/
function theSorter ( rules, dest ) {

    if (!(dest instanceof jQuery)) {
        console.log("[ERROR]: Expected var dest to be of type jQuery Object, but instead found "+typeof dest+".");
        return;
    }

    var jquerys = {}, subs = {}, fields = {}, action = [];

    $.each(rules, function (k,v) {
        
        if (k.indexOf('fn.') > -1) {

            jquerys[k.replace('fn.','')] = v;
        } else if (k == 'this.subs') {
            
            $.each(v, function (field, stuff) {
                subs[field] = stuff;
            });
        } else if (k == 'this.action') {
            
            if (typeof v == 'object') {
                
                $.each(v, function (key, func) {
                    action.push(func);
                });
            } else {
                
                action.push(v);
            }
        } else {

            if (typeof v == 'object') {
                
                fields[k] = v;
            } else {
                
                fields[k] = {'fn.html': checkForEval(v)};
            }
        }
    });

    // Loop through all of the jQuery methods/functions
    if (Object.keys(jquerys).length > 0) {
        actionLoop(jquerys,dest);
    }

    // Run any actions present on this field
    if (!(typeof action === 'undefined')) {
        actionLoop(action,dest);
    }

    // Make any subs from the sub rules on this field
    if (Object.keys(subs).length > 0) {
        $.each(subs, function (k,v) {
            theSorter(v,dest.find('#'+k));
        });
    }

    // Run any rules for fields referenced by this field
    if (Object.keys(fields).length > 0) {
        $.each(fields, function (k,v) {
            theSorter(v,$('#'+k));
        });
    }
}

/*
*  This is the second stage in updating the liveform.
*  This can probably be made to be more fundamental
*/
function stageTwo (src, dst, fid, frd) {

    if (typeof fid === 'undefined') {
        fid = src.attr('id');
    }

    if (typeof frd === 'undefined') {
        frd = src.closest('form').attr('id');
    }
    
    if (fid in formRules[frd]){

        var theseRules = formRules[frd][fid];

        if(typeof theseRules == 'string') {
            dst.html(theseRules);
            return;
        };

        var toClean = [];
        var newVal,state;
        
        switch (src.attr('type')) {
            case 'radio':

                // Set the selected radio button's ID to the state variable
                group = src.attr('name');
                state = (src.attr('id')).replace(group+'-','');

                theSorter( theseRules[state], dst );

                // Build our array of fields to clear
                // $.each(theseRules, function (option,rule) {
                //     if (typeof rule == 'string') {
                //         if (toClean.indexOf(dst.attr('id')) == -1) {
                //             toClean.push(dst.attr('id'));
                //         }
                //     } else if (typeof rule == 'object') {
                //         $.each(rule, function (k,v) {
                //             toClean.push(k);
                //         });
                //     } else {
                //         console.log("[ERROR]: Variable of type "+typeof state+" found in "+src.prop('checked')+", but expected string or object.");
                //         return;
                //     }

                //     if (fid+'-'+option == state) {
                //         newVal = rule;
                //     }
                // });
                // return;

                // theCleaner(toClean);

                // if (typeof newVal == 'string') {
                //     dst.html(newVal);
                // } else {
                //     $.each(newVal, function (k,v) {
                //         $('#'+k).html(v);
                //     });
                // }
                break;

            case 'checkbox':

                // Put the state of the checkbox into a variable for retrieving our rules
                state = (src.prop('checked')) ? 'checked' : 'unchecked';

                theCleaner(theDigger(theseRules));
                theSorter(theseRules[state], dst);

                break;

            default:

                if (src.is('select')) {
                    
                    $.each(src.find('option:selected'), function (k,v) {
                        theCleaner(theDigger(theseRules[v.value]));
                    });

                    $.each(src.find('option:selected'), function (k,v) {
                        theSorter(theseRules[v.value], dst);
                    });

                    return;
                }

                theSorter( theseRules, dst );

                break;
        }

    } else {

        dst.html(src.val());
    }
}

/*
*  This is the first stage in updating the liveform.
*  This can probably be made to be more fundamental
*/
function stageOne (fieldID, evt) {
    
    // Get our event type
    fired = evt.type;

    // If the event type is not one of 'keyup' or 'blur' or 'change', exit immediately and throw an error
    if ( ( ['keyup','change','blur'] ).indexOf( fired ) === -1 ) {
        console.log("[ERROR]: Event of type "+evt.type+" fired, but expected one of (change/keyup/blur).");
        return;
    }

    /*
    *  set some variables:
    *  source: the field in the form we are referecing
    *  fieldID: the name/id of the source form field
    *  dest: the field in the liveform we will likely be making changes against
    */
    var source = $('#'+fieldID);
    var fieldID = (source.attr('type') == 'radio') ? source.attr('name') : fieldID;
    var dest = $('#live-'+source.closest('form').attr('id')+' #live_'+fieldID);

    if ((!source.val()) && (fired == 'blur') && (( ['radio','checkbox'] ).indexOf( source.attr('type') ) === -1) && (!(source.is('select')))) {
        
        // Clear the destination field if the event is a 'blur' event and the field is a type of text input field
        theCleaner(dest);
        return;

    }

    if ( (fired == "blur") && (source.is('select')) ) {
        
        // Proceed to the stageTwo function if we get a 'blur' event on a select field type
        stageTwo(source, dest, fieldID);
        return;
    }

    if ((!(source.is('select'))) && ((fired == "change") || ((fired == "keyup") && (( ['radio','checkbox'] ).indexOf( source.attr('type') ) === -1 )))) {

        if ( source.attr('type') == 'radio' ) {
            dest = $('#live-'+source.closest('form').attr('id')+' #live_'+source.attr('id').replace('-','_'));
        }

        // Proceed to the stageTwo function if we get a 'change' event for any field type, or a 'keyup' event for any text input field type
        stageTwo(source, dest, fieldID);
        return;
    }
}

// var formRules is the JSON object holding the rules for the form(s)

$(document).ready(function() {
    
    var forms = $('form');

    forms.each(function() {

        if (typeof formRules[$(this).attr('id')] != "undefined") {
            
            var textFields = $(this).find( 'input, textarea, select' );

            textFields.each(function () {

                $(this).on('change keyup blur', function (e) {
                    stageOne($(this).attr('id'), e);
                });
            });
        }
    });

    $('#live-form-preview h3').click( function() {

        var preview = ($('#live-form-preview .wrapper').height() > 0) ? 0 : 1000;
        $('#live-form-preview .wrapper').slideToggle(300, function() {
            $('#live-form-preview').toggleClass('closed');
        });

        // $('#live-form-preview .wrapper').animate({
        //     'max-height': preview
        // },{
        //     duration: 150,
        //     complete: function() {
        //         // $('#live-form-preview').toggleClass('closed');
        //     }
        // });

        $('#live-preview-title').removeClass('updates');
    });
});