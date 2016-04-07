/*
*  This is the cleanup function, to clear fields as necessary, and is called periodically in stage 1 and 2
*  obj expects a jQuery object, or an array of fieldIDs to clear
*/
function doCleanup (obj) {

    if (typeof obj == 'object') {
        if (obj instanceof jQuery) {
            obj.html('');
        } else {
            $.each(obj, function (k,v) {
                if (v instanceof jQuery) {
                    v.html('');
                } else {
                    $('#'+v).html('');
                    // console.log('cleaned '+v);
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
*  @paran {string} val
*  @return {string}
*/
function checkForEval(val) {

    if (!(typeof val == 'string')) {
        console.log("[ERROR]: Variable of type "+typeof val+" found, but expected string or object.");
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
function actionLoop (actions) {

    $.each(actions, function (dest,rules) {

        $.each(rules, function (type,action) {

            if (type == '_action') {
                eval(action);
                return;
            }

            var args = action;

            if (typeof action == 'object') {
                args = {};
                $.each(action, function (key,val) {
                    args[key] = checkForEval(val);
                });
            } else {
                args = checkForEval(action);
            }

            $('#'+dest)[type](args);
        });
    });
}

/*
*  This is the second stage in updating the liveform.  This can probably be made to be more fundamental
*/
function makeChanges (src, dst, fid, frd) {

    if (typeof fid === 'undefined') {
        fid = src.attr('id');
    }

    if (typeof frd === 'undefined') {
        frd = src.closest('form').attr('id');
    }
    
    if (fid in formRules[frd]){

        var theseRules = formRules[frd][fid];
        var toClean = [];
        var newVal,state;
        
        switch (src.attr('type')) {
            case 'radio':
                // Set the state of the checkbox to a variable for retrieving our rules
                state = src.attr('id');

                // Build our array of fields to clear
                $.each(theseRules, function (option,rule) {
                    if (typeof rule == 'string') {
                        if (toClean.indexOf(dst.attr('id')) == -1) {
                            toClean.push(dst.attr('id'));
                        }
                    } else if (typeof rule == 'object') {
                        $.each(rule, function (k,v) {
                            toClean.push(k);
                        });
                    } else {
                        console.log("[ERROR]: Variable of type "+typeof state+" found in "+src.prop('checked')+", but expected string or object.");
                        return;
                    }

                    if (fid+'-'+option == state) {
                        newVal = rule;
                    }
                });

                doCleanup(toClean);

                if (typeof newVal == 'string') {
                    dst.html(newVal);
                } else {
                    $.each(newVal, function (k,v) {
                        $('#'+k).html(v);
                    });
                }
                break;

            case 'checkbox':
                // Set the state of the checkbox to a variable for retrieving our rules
                state = (src.prop('checked')) ? 'checked' : 'unchecked';

                // Build our array of fields to clear
                $.each(theseRules, function (option,rule) {
                    
                    if (typeof rule == 'string') {
                        toClean[dst.attr('id')] = rule;
                    } else if (typeof rule == 'object') {
                        $.each(rule, function (k,v) {
                            toClean[k] = v;
                        });
                    } else {
                        console.log("[ERROR]: Variable of type "+typeof state+" found in "+src.prop('checked')+", but expected string or object.");
                        return;
                    }

                    if (option == state) {
                        newVal = rule;
                    }
                });

                doCleanup(Object.keys(toClean));

                if (typeof newVal == 'string') {
                    dst.html(newVal);
                } else {
                    $.each(newVal, function (k,v) {
                        $('#'+k).html(v);
                    });
                }
                break;

            default:

                var actions;
                
                if ("_val" in theseRules) {
                    
                    actions = {};

                    if (typeof theseRules["_val"] == 'string') {
                        actions[dst.attr('id')] = {'html': theseRules["_val"]};
                    } else {
                        $.each(theseRules["_val"], function (field,content) {
                            actions[field] = {'html': content};
                        });
                    }

                    // We have to fully run this first, because if not our elements might not exist for the subs below
                    actionLoop(actions);
                }

                if ("_subs" in theseRules) {

                    actions = {};

                    $.each(theseRules["_subs"], function (id,rules) {
                        
                        actions[id] = rules;

                    });

                    actionLoop(actions);
                }

                break;
        }
    } else {
        dst.html(src.val());
    }
}

/*
*  This is the first stage in updating the liveform.  This can probably be made to be more fundamental
*/
function updateLiveForm (fieldID, evt) {
    
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

    if ((!source.val()) && (fired == 'blur') && (( ['radio','checkbox'] ).indexOf( source.attr('type') ) === -1)) {
        
        // Clear the field if the event is a 'blur' event and the field is a type of text input field
        doCleanup(dest);
        return;

    } else if ((fired == "change") || ((fired == "keyup") && (( ['radio','checkbox'] ).indexOf( source.attr('type') ) === -1 ))) {
        
        // Proceed to the makeChanges function if we get a 'change' event for any field type, or a 'keyup' event for any text input field type
        makeChanges(source, dest, fieldID);
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
                    updateLiveForm($(this).attr('id'), e);
                    console.log('you touched me');
                });
            });
        }
    });
});