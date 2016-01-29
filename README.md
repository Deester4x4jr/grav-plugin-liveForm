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

**form_field_name:**
	MUST match name of field to be acted upon

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