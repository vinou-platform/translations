<?php
namespace Vinou\Translations\Utilities;


/**
* Translation
*/
class Translation {

	public $data = [];
	public $countryCode = 'de';
	public $llPath = NULL;
	public $extKey = 'vinou';
	public $dictionary = NULL;

	public function __construct($countryCode = NULL) {
		$this->llPath = __DIR__.'/../../Resources/';
		is_null($countryCode) ? $this->init($this->countryCode) : $this->init($countryCode);
	}

	private function init($countryCode) {
		$this->dictionary = json_decode(file_get_contents($this->llPath.$countryCode.'.json'),TRUE);

		$this->data['regions'] = $this->dictionary['wineregions'];
		$this->data['winetypes'] = $this->dictionary['winetypes'];
		$this->data['tastes'] = $this->dictionary['tastes'];

		$grapetypes = [];
		foreach ($this->dictionary['grapetypes'] as $id => $grapetype) {
			$grapetypes[$id] = $grapetype['name'];
		}
		$this->data['grapetypes'] = $grapetypes;
	}

	public function getRegion($id){
		if (isset($this->data['regions'][$id])) {
			return $this->data['regions'][$id];
		} else {
			return false;
		}
	}

	public function getType($type){
		if (isset($this->data['winetypes'][$type])) {
			return $this->data['winetypes'][$type];
		} else {
			return false;
		}
	}

	public function getTaste($id){
		if (isset($this->data['tastes'][$id])) {
			return $this->data['tastes'][$id];
		} else {
			return false;
		}
	}

	public function getGrapeType($id){
		if (isset($this->data['grapetypes'][$id])) {
			return $this->data['grapetypes'][$id];
		} else {
			return false;
		}
	}

	public function getValueByKey($key,$id){
		if (isset($this->data[$key][$id])) {
			return $this->data[$key][$id];
		} else {
			return false;
		}
	}

	public function get($countryCode = NULL,$selector = NULL) {
		is_null($countryCode) ? $countryCode = $this->countryCode : $countryCode = $countryCode;
		$all = json_decode(file_get_contents($this->llPath.$countryCode.'.json'),TRUE);
		if (is_null($selector)) {
			return $all;
		} else {
			$returnArr = $this->findKeyInArray($selector,$all);
			// if (is_string($returnArr)) $returnArr = ['value' => $returnArr];
			return $returnArr;
		}
	}

	/**
	 *
	 * localize wine
	 *
	 * @param array $wine
	 * @return array
	 */
	public function localizeWine($wine = NULL) {
		foreach ($wine as $property => $value) {
			switch ($property) {
				case 'grapetypes':
					if (!empty($value)) {
						$grapetypes = [];
						foreach ($value as $grapetype) {
							if ($this->getGrapeType($grapetype) !== false) {
								$grapetypes[$grapetype] = $this->getGrapeType($grapetype);
							}
						}
						$wine[$property] = $grapetypes;
					}
					break;
				case 'type':
					if ($this->getType($value) !== false) $wine[$property] = $this->getType($value);
					break;
				case 'tastes_id':
					if ($this->getTaste($value) !== false) $wine[$property] = $this->getTaste($value);
					break;
				case 'region':
					if ($this->getRegion($value) !== false) $wine[$property] = $this->getRegion($value);
					break;
				default:
					$wine[$property] = $value;
					break;
			}
		}
		return $wine;
	}


	protected function findKeyInArray($keyArray,$array) {
		$searchArray = $array;
		foreach ($keyArray as $key) {
			if (isset($searchArray[$key])) {
				$searchArray = $searchArray[$key];
			}
		}
		return $searchArray;
	}

}