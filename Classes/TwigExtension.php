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
			new \Twig_Filter('getLLArray', array(&$this, 'getLLArray')),
			new \Twig_Filter('sortKeysByArray', array(&$this, 'sortKeysByArray')),
			new \Twig_Filter('sortByArray', array(&$this, 'sortByArray')),
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

	public function getLLArray($key, $countryCode = null, $args = null) {
		return $this->translator->get($countryCode, $key, $args);
	}

	public function sortKeysByArray($array, $sortArray) {
		$result = [];
		foreach ($sortArray as $key) {
			if (array_key_exists($key, $array))
				$result[$key] = $array[$key];
		}
		return $result;
	}

	public function sortByArray($array, $sortArray) {
		$result = [];
		foreach ($sortArray as $value) {
			if (in_array($value, $array))
				$result[] = $value;
		}
		return $result;
	}
}
