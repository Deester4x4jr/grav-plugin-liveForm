# grav-plugin-liveForm
Enables live forms in conjunction with the Import and Form plugins

## Structure, order of operations, and instructions for live.yaml:

#### Structure:

```yaml
live_form_defaults: |-
    <div>Default Shell for the body of your form contents</div>
live_form_snippets:
    form_field_name_1: # This is the field name as defined in the frontmatter of your corresponding form
    	field_id: 'defaults_to_field_name' # [OPTIONAL] This is the ID of an element to inject code into, if different than the field name 
        code: |-
            <span><a id="id_of_element_to_mod">contents</a></span>
        subs:
            id_of_element_to_mod:
                html: regex-or-string # This will replace the contents of the element with the specified id above (using jquery .html()). If omitted this will just be the form field value
                attr: # list of attributes to modify (using jquery selectors)
                    href: regex-or-string
                    title: regex-or-string
                    style: regex-or-string
                    etc: ...
	form_field_name_2: # This is an example of a radio field where we are placing the contents into an element with an id of the form field name
        img: |-
            <div>Stuff</div>
        txt: |-
            <div>Stuff</div>
    form_field_name_3: # This is an example of a checkbox field where we are placing the contents into different elements per option
        checked:
            logo: |-
                <td valign=middle style=border:none;padding:0><div style="text-align:left;margin:0 0 .75rem 0"><a href=http://www.tegile.com target=_blank><img height=40 src=http://webdev.tegile.com/wp-content/uploads/2015/12/logo.png></a></div>
        unchecked:
            company: |-
                <span style="color: #1c5ea1; font-size: 13px; font-weight: bold; ">Tegile</span>
```

#### Order of Operations:

1. If no rule exists, we assume the following:
    1. The _destination_ fieldID will be: _#live\_[fieldID]_
    1. The _destination_ field's html will become the _Source Form Field's_ value
1. If a rule exists, we check the following:
    1. If the rule is a string:
        1. The _destination_ field's html will become the string
    1. If the rule is an object:
        1. Any [valid jQuery method](http://api.jquery.com/) can be used as a _key: value_ pair, as long as the method is prepended by an **_underscore_**.  Some examples:
            - The _destination_ field's html will become the _\_html_ key's value, using [jQuery.html()](http://api.jquery.com/html/)
            - The _destination_ field can have a class applied using the _\_addClass_ key, which uses the [jQuery.addClass()](http://api.jquery.com/addclass/) method
        1. Any jQuery method that accepts multiple parameters can be used as well, with _key: value_ pairs beneath it.  Some examples:
            - attr: uses [jQuery.attr()](http://api.jquery.com/attr/)
            - css: uses [jQuery.css()](http://api.jquery.com/css/)
        1. The following **special methods** may be used as well:
            1. _\_\_subs_:
                1. Will be parsed to determine if any substitutions need to be made on the new html in the _destination_ field
                1. Each substitution should have the field ID to be acted upon as a _key_ with _key: value_ pairs beneath it, following the same rules as the _destination_ field (jQuery methods with leading underscore, etc...)
                1. There is no limit to the depth of fields with substitutions that can be chained... Just make sure you can manage your own code
            1. _\_\_action_:
                1. Use this method if you would like to add raw jQuery or Javascript to be run when interacting with a particular field
                1. the _\_\_action_ method be be used under any field _key_ to be acted upon as well
        1. Any additional field to be acted upon may be specified as a _key: value_ pair as well
            1. The _key_ must be the field ID
            1. The value may be a set of _key: value_ pairs, following the same rules as the _destination_ field (jQuery methods with leading underscore, etc...)
            1. There is no limit to the depth of fields with substitutions that can be chained... Just make sure you can manage your own code

            1. The field is a _Radio_:
            1. The field is a _Checkbox_:
            1. The field is a _Text Input_:
                1. If the 
                1. The _destination_ value will become the value of the _\_val_ key
                1. 

#### Rules to Follow:
**form field name:**
	**_MUST_** match name of field to be acted upon

**field_id:**
	if found use as parent container id
	if not found, use field_name as parent container id

**field types:**
	Field types are determined by looking at the form itself, which is why the form_field_name must match the name of the form field defined in the form page frontmatter
	if textfield or textarea:
		array values are 'code' and 'subs'
	if radio:
		array values are not 'code' and 'subs', but instead must be names of the different radio options.
	if checkbox:
		array values are not 'code' and 'subs', but instead must be 'true' and 'false'.