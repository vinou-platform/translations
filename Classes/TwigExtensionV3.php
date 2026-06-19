<?php
namespace Vinou\Translations;

/**
 * Twig 3 compatible translation extension.
 * Drop-in replacement for TwigExtension when using twig/twig ^3.0.
 * The original TwigExtension (Twig 1/2) is kept unchanged for other projects.
 */
class TwigExtensionV3 extends \Twig\Extension\AbstractExtension {

	private $translator;

	public function __construct($countryCode = null) {
		$this->translator = new Utilities\Translation($countryCode);
	}

	public function getFilters() {
		return [
			new \Twig\TwigFilter('translate', [$this, 'translate']),
			new \Twig\TwigFilter('getLLArray', [$this, 'getLLArray']),
			new \Twig\TwigFilter('sortKeysByArray', [$this, 'sortKeysByArray']),
			new \Twig\TwigFilter('sortByArray', [$this, 'sortByArray']),
		];
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
