<?php
namespace Grav\Plugin;

use \Grav\Common\Plugin;
use \Grav\Common\Grav;
use \Symfony\Component\Yaml\Yaml;

class LiveFormPlugin extends Plugin
{	
	/**
     * @return array
     */
	public static function getSubscribedEvents()
    {
	    return [
	        'onThemeInitialized' => ['onThemeInitialized', 0],
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
        $this->grav['twig']->twig_paths[] = 'plugin://liveform/assets/templates';
    }

    /**
     * Load our custom JS file on Page Init.
     */
    public function onTwigSiteVariables()
    {
        if ( !(pathinfo($this->grav['page']->name(), PATHINFO_FILENAME) == 'liveform') ) {
            return;
        }

        # Scan the JS directory for this plugin, and build our collection of JS Files
        $assetsDir = new \FilesystemIterator('plugin://liveform/assets/js');
        $liveform_bits = [];

        foreach ($assetsDir as $asset) {
            if ($asset->isFile()) {
                $liveform_bits[] = $asset->getPathname();
            }
        }

        # Build our custom inline JS string from the imported live.yaml file
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

        # Get the Assets object
        $assets = $this->grav['assets'];

        # Define and add our JS Collection
        $assets->registerCollection('liveform', $liveform_bits);
        $assets->add('liveform', 100);

        # add our inline JS object
        $assets->addInlineJs($inlineJS,110);
    }
}