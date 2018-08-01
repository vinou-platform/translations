<?php
namespace Vinou\Translations\Utilities;


/**
 * Translation
 */
class Translation {

	public $data = [];
	public $countryCode = 'de';
	public $llPath = null;
	public $extKey = 'vinou';

	private $dictionary = [];

	public function __construct($countryCode = null) {
		$this->llPath = __DIR__ . '/../../Resources/';
		if (!is_null($countryCode))
			$this->countryCode = $countryCode;
	}

	public function getRegion($id) {
		return $this->getValueByKey('regions', $id);
	}

	public function getType($type) {
		return $this->getValueByKey('winetypes', $type);
	}

	public function getTaste($id) {
		return $this->getValueByKey('tastes', $id);
	}

	public function getGrapeType($id) {
		return $this->getValueByKey('grapetypes', $id);
	}

	public function getValueByKey($key, $id) {
		$this->loadCountryCode($this->countryCode);
		return isset($this->data[$key][$id]) ? $this->data[$key][$id] : false;
	}

	// TODO switch $countryCode and $selector param order to match implementation in angular.
	public function get($countryCode = null, $selector = null, $args = null) {
		if (is_null($countryCode))
			$countryCode = $this->countryCode;
		$this->loadCountryCode($countryCode);
		$result = $this->dictionary[$countryCode];
		if (!is_null($selector)) {
			$result = self::findKeyInArray($selector, $result);
			// Handle parameterized translations.
			if ($result && $args && is_string($result) && is_array($args)) {
				$result = preg_replace_callback('/\{([a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)*)\}/i', function($m) use ($args) {
					return self::findKeyInArray($m[1], $args);
				}, $result);
			}
		}
		return $result;
	}

	/**
	 *
	 * localize wine
	 *
	 * @param array $wine
	 * @return array
	 */
	public function localizeWine($wine = null) {
		$this->loadCountryCode($this->countryCode);
		foreach ($wine as $property => $value) {
			switch ($property) {
				case 'grapetypes':
					if (!empty($value)) {
						$grapetypes = [];
						foreach ($value as $id) {
							$grapetype = $this->getGrapeType($id);
							if ($grapetype !== false)
								$grapetypes[$id] = $grapetype;
						}
						$wine[$property] = $grapetypes;
					}
					break;
				case 'type':
					$value = $this->getType($value);
					if ($value !== false)
						$wine[$property] = $value;
					break;
				case 'tastes_id':
					$value = $this->getTaste($value);
					if ($value !== false)
						$wine[$property] = $value;
					break;
				case 'region':
					$value = $this->getRegion($value);
					if ($value !== false)
						$wine[$property] = $value;
					break;
				default:
					$wine[$property] = $value;
					break;
			}
		}
		return $wine;
	}

	protected function loadCountryCode($code, $setDefault = false) {
		if (!isset($this->dictionary[$code])) {
			$dictionary = json_decode(file_get_contents($this->llPath . $code . '.json'), true);
			if (!$dictionary)
				return false;
			
			$this->dictionary[$code] = $dictionary;

			// Initialize lookups.
			if (($code == $this->countryCode) || $setDefault) {
				$this->data['regions'] = $dictionary['wineregions'];
				$this->data['winetypes'] = $dictionary['winetypes'];
				$this->data['tastes'] = $dictionary['tastes'];

				$grapetypes = [];
				foreach ($dictionary['grapetypes'] as $id => $grapetype) {
					$grapetypes[$id] = $grapetype['name'];
				}
				$this->data['grapetypes'] = $grapetypes;
			}
		}
		if ($setDefault)
			$this->countryCode = $code;

		return true;
	}

	protected static function findKeyInArray($keyArray, $searchArray) {
		if (!is_array($keyArray))
			$keyArray = explode('.', $keyArray);
		foreach ($keyArray as $key) {
			if (isset($searchArray[$key]))
				$searchArray = $searchArray[$key];
		}
		return $searchArray;
	}

}