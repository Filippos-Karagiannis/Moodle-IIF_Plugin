<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * I3F configuration form
 *
 * @package    mod_i3f
 * @copyright  2009 Petr Skoda  {@link http://skodak.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;
require_once ($CFG->dirroot.'/course/moodleform_mod.php');
require_once($CFG->dirroot.'/mod/i3f/locallib.php');

class mod_i3f_mod_form extends moodleform_mod {
    function definition() {
        global $CFG, $DB, $PAGE;
        $PAGE->requires->js_call_amd('mod_i3f/validation', 'init'); //include the javascript in the page
        $PAGE->requires->js_call_amd('mod_i3f/sruquery', 'init'); 
        $mform = $this->_form;

        $config = get_config('i3f');

        $route = moodle_url::make_pluginfile_url($this->context->id, 'mod_i3f', 'get_sru_any', $this->id, '/', '/', false);
        $mform->addElement('hidden', 'pluginfile_url', $route);
        //-------------------------------------------------------
        $mform->addElement('header', 'mass_import', get_string('mass_import', 'i3f'));
        $mform->addElement('button', 'search_vl', 'search');
        $mform->addElement('button', 'build_form', 'construct');
        $mform->addElement('html', '  <p id="location" style="visibility: hidden"></p>');
        //-------------------------------------------------------
        $mform->addElement('header', 'general', get_string('general', 'form'));
        $mform->addElement('html', '  <p>Please select your language:</p>');
        $radioarray=array();
        $radioarray[] = $mform->createElement('radio', 'language', '', get_string('english', 'i3f'), 1, $attributes);
        $radioarray[] = $mform->createElement('radio', 'language', '', get_string('german', 'i3f'), 2, $attributes);
        $radioarray[] = $mform->createElement('radio', 'language', '', get_string('italian', 'i3f'), 3, $attributes);
        $mform->addGroup($radioarray, 'radioar', '', array(' '), false);
        $mform->addElement('url', 'externalurl', get_string('externalurl', 'i3f'), array('size'=>'60'), array('usefilepicker'=>false));
        $mform->setType('externalurl', PARAM_RAW_TRIMMED);
        $mform->addRule('externalurl', null, 'required', null, 'client');
        $mform->addElement('button', 'intro', 'validate link'); // add a button named 'validate link' <- need get_string function to be translated
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'60'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');
        $this->standard_intro_elements();
        $element = $mform->getElement('introeditor');
        $attributes = $element->getAttributes();
        $attributes['rows'] = 30;
        $element->setAttributes($attributes);
        //-------------------------------------------------------
        

        //-------------------------------------------------------
        $this->standard_coursemodule_elements();

        //-------------------------------------------------------
        $this->add_action_buttons();
    }

    function data_preprocessing(&$default_values) {
        if (!empty($default_values['displayoptions'])) {
            $displayoptions = unserialize($default_values['displayoptions']);
            if (isset($displayoptions['printintro'])) {
                $default_values['printintro'] = $displayoptions['printintro'];
            }
            if (!empty($displayoptions['popupwidth'])) {
                $default_values['popupwidth'] = $displayoptions['popupwidth'];
            }
            if (!empty($displayoptions['popupheight'])) {
                $default_values['popupheight'] = $displayoptions['popupheight'];
            }
        }
        if (!empty($default_values['parameters'])) {
            $parameters = unserialize($default_values['parameters']);
            $i = 0;
            foreach ($parameters as $parameter=>$variable) {
                $default_values['parameter_'.$i] = $parameter;
                $default_values['variable_'.$i]  = $variable;
                $i++;
            }
        }
    }

    function validation($data, $files) {
        $errors = parent::validation($data, $files);

        // Validating Entered url, we are looking for obvious problems only,
        // teachers are responsible for testing if it actually works.

        // This is not a security validation!! Teachers are allowed to enter "javascript:alert(666)" for example.

        // NOTE: do not try to explain the difference between URL and URI, people would be only confused...

        if (!empty($data['externalurl'])) {
            $url = $data['externalurl'];
            $validate = json_decode($url->externalurl);
            if (preg_match('|^/|', $url)) {
                // links relative to server root are ok - no validation necessary

            } else if (preg_match('|^[a-z]+://|i', $url) or preg_match('|^https?:|i', $url) or preg_match('|^ftp:|i', $url)) {
                // normal URL
                if (!i3f_appears_valid_url($url)) {
                    $errors['externalurl'] = get_string('invalidurl', 'i3f');
                }

            } else if (!i3f_json_validation($url->externalurl)) {
                $errors['externalurl'] = get_string('invalidurl', 'i3f');

            } else {
                // invalid URI, we try to fix it by adding 'http://' prefix,
                // relative links are NOT allowed because we display the link on different pages!
                if (!i3f_appears_valid_url('http://'.$url)) {
                    $errors['externalurl'] = get_string('invalidurl', 'i3f');
                }
            }
        }
        return $errors;
    }

}
