<?php
namespace Vinou\Translation\Utilities;


/**
* Translation
*/
class Translation {

	protected $data = [];
	protected $countryCode = 'de';
	protected $llPath = NULL;
	protected $extKey = 'vinou';

	public function __construct($countryCode = NULL) {
		$this->llPath = __DIR__.'/../../Resources/';
		is_null($countryCode) ? $this->init($this->countryCode) : $this->init($countryCode);
	}

	private function init($countryCode) {
		$allwineregions = json_decode(file_get_contents($this->llPath.'wineregions.json'),true);
		$this->data['regions'] = $allwineregions[$countryCode];
		$allwinetypes = json_decode(file_get_contents($this->llPath.'winetypes.json'),true);
		$this->data['winetypes'] = $allwinetypes[$countryCode];
		$alltastes = json_decode(file_get_contents($this->llPath.'tastes.json'),true);
		$this->data['tastes'] = $alltastes[$countryCode];

		$grapetypes = array();
		foreach (json_decode(file_get_contents($this->llPath.'grapetypes.json'),true) as $id => $grapetype) {
			$grapetypes[$id] = $grapetype['name'];
		}
		$this->data['grapetypes'] = $grapetypes;
	}

	public function getRegion($id){
		return $this->data['regions'][$id];
	}

	public function getType($type){
		return $this->data['regions'][$type];
	}

	public function getTaste($id){
		return $this->data['tastes'][$id];
	}

	public function getGrapeType($id){
		return $this->data['grapetypes'][$id];
	}

	public function getValueByKey($key,$id){
		return $this->data[$key][$id];
	}

}