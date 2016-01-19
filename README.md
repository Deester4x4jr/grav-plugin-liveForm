# grav-plugin-liveForm
Enables live forms in conjunction with the Import and Form plugins

## Structure, order of operations, and instructions for live.yaml:
---
### Structure:

```yaml
live_form_defaults: |-
    <div>Default Shell for the body of your form contents</div>
live_form_snippets:
    form_field_name: # This is the field name as defined in the frontmatter of your corresponding form
    field_id: 'defaults_to_field_name' # [OPTIONAL] This is the ID of an element inject code into, if different than the field name 
        code: |-
            <span><a id="id_of_element_to_mod">contents</a></span>
        subs:
            id_of_element_to_mod:
                html: contents # This will replace the contents of the element with the specified id above (using jquery .html())
                attr: # list of attributes to modify (using jquery selectors)
                    href: regex-or-string
                    title: regex-or-string
                    style: regex-or-string
                    etc: ...
```

form_field_name:
	**MUST** match name of field to be acted upon

field_id:
	if found use as parent container id
	if not found, use field_name as parent container id

field types:
	Field types are determined by looking at the form itself, which is why the form_field_name must match the name of the form field defined in the form page frontmatter
	if textfield or textarea:
		array values are 'code' and 'subs'
	if radio:
		array values are not 'code' and 'subs', but instead must be names of the different radio options.
	if checkbox:
		array values are not 'code' and 'subs', but instead must be 'true' and 'false'.