<?php
namespace Grav\Plugin;

use \Grav\Common\Plugin;
use \Grav\Common\Grav;
use \Symfony\Component\Yaml\Yaml;
use RocketTheme\Toolbox\Event\Event;

class LiveFormPlugin extends Plugin
{	
	/**
     * @return array
     */
	public static function getSubscribedEvents()
    {
	    return [
	        'onThemeInitialized' => ['onThemeInitialized', 0],
            'onGetPageTemplates' => ['onGetPageTemplates', 0],
	    ];
	}

    /**
     * Initialize configuration
     */
    public function onThemeInitialized()
    {
        if ($this->isAdmin()) {
            return;
        }

        $this->enable([
            'onTwigTemplatePaths' => ['onTwigTemplatePaths', 0],
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0],
        ]);
    }

	/**
     * Add current directory to twig lookup paths.
     */
    public function onTwigTemplatePaths()
    {
        $this->grav['twig']->twig_paths[] = 'plugins://liveform/templates';
    }

    /**
     * Load our custom JS & CSS files on Page Init.
     */
    public function onTwigSiteVariables()
    {

        if ( !(pathinfo($this->grav['page']->name(), PATHINFO_FILENAME) == 'liveform') ) {
            return;
        }

        # Get the Assets object
        $assets = $this->grav['assets'];

        # Initialize our bits variable
        $liveform_bits = [];

        foreach ( ['css','js'] as $k => $v) {

            # Scan the parent directories for this plugin, and build our collection of JS Files
            $assetsDir = new \FilesystemIterator('plugins://liveform/'.$v);

            foreach ($assetsDir as $asset) {
                if ($asset->isFile()) {
                    $liveform_bits[] = $asset->getPathname();
                }
            }

            if ($v == 'js') {

                # Build our custom inline JS string from the imported live.yaml file
                # Dependent on the imports plugin
                $rules = $this->grav['page']->header()->imports['live'];
                $inlineJS = 'var formRules = {';
                
                foreach ($rules as $formname => $ruleset) {
                    
                    $ruleset = $ruleset['actions'];
                    $inlineJS .= '"' . $formname . '": ' . json_encode($ruleset);
                    
                    if (!($formname === end($rules))) {
                        $inlineJS .= ",";
                    }
                }

                $inlineJS .= "};";

                # add our inline JS object
                $assets->addInlineJs($inlineJS,110);
            }
        }

        # Define and Add our Collection
        $assets->registerCollection('liveform', $liveform_bits);
        $assets->add('liveform', 100);
    }

    /**
     * Add page template types.
     */
    public function onGetPageTemplates(Event $event)
    {
        /** @var Types $types */
        $types = $event->types;
        $types->scanTemplates('plugins://liveform/templates');
    }
}