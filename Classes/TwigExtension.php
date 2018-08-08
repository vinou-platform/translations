<?php
namespace Vinou\Translations;

/**
 * Simple twig filter implementation to use translations within twig templates.
 */
class TwigExtension extends \Twig_Extension {

	private $translator;

	public function __construct($countryCode = null) {
		$this->translator = new Utilities\Translation($countryCode);
	}

	public function getFilters() {
		return array(
			new \Twig_Filter('translate', array(&$this, 'translate')),
		);
	}

	public function translate($key, $countryCode = null, $args = null) {
		if ($countryCode && !is_string($countryCode)) {
			$args = $countryCode;
			$countryCode = null;
		}
		if ($args)
			$args = $this->forceArray($args);

		$value = $this->translator->get($countryCode, $key, $args);
		return !$value || is_array($value) ? $key : $value;
	}

	private function forceArray($o) {
		$a = (array)$o;
		foreach ($a as &$v) {
			if (is_object($v))
				$v = $this->forceArray($v);
		}
		return $a;
	}
}
