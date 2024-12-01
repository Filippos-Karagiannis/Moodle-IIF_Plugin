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
 * i3f module admin settings and defaults
 *
 * @package    mod_i3f
 * @copyright  2009 Petr Skoda  {@link http://skodak.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    require_once("$CFG->libdir/resourcelib.php");

    $displayoptions = resourcelib_get_displayoptions(array(RESOURCELIB_DISPLAY_AUTO,
                                                           RESOURCELIB_DISPLAY_EMBED,
                                                           RESOURCELIB_DISPLAY_FRAME,
                                                           RESOURCELIB_DISPLAY_OPEN,
                                                           RESOURCELIB_DISPLAY_NEW,
                                                           RESOURCELIB_DISPLAY_POPUP,
                                                          ));
    $defaultdisplayoptions = array(RESOURCELIB_DISPLAY_AUTO,
                                   RESOURCELIB_DISPLAY_EMBED,
                                   RESOURCELIB_DISPLAY_OPEN,
                                   RESOURCELIB_DISPLAY_POPUP,
                                  );

    //--- general settings -----------------------------------------------------------------------------------
    $settings->add(new admin_setting_configtext('i3f/framesize',
        get_string('framesize', 'i3f'), get_string('configframesize', 'i3f'), 130, PARAM_INT));
    $settings->add(new admin_setting_configpasswordunmask('i3f/secretphrase', get_string('password'),
        get_string('configsecretphrase', 'i3f'), ''));
    $settings->add(new admin_setting_configcheckbox('i3f/rolesinparams',
        get_string('rolesinparams', 'i3f'), get_string('configrolesinparams', 'i3f'), false));
    $settings->add(new admin_setting_configmultiselect('i3f/displayoptions',
        get_string('displayoptions', 'i3f'), get_string('configdisplayoptions', 'i3f'),
        $defaultdisplayoptions, $displayoptions));

    //--- modedit defaults -----------------------------------------------------------------------------------
    $settings->add(new admin_setting_heading('urlmodeditdefaults', get_string('modeditdefaults', 'admin'), get_string('condifmodeditdefaults', 'admin')));

    $settings->add(new admin_setting_configcheckbox('i3f/printintro',
        get_string('printintro', 'i3f'), get_string('printintroexplain', 'i3f'), 1));
    $settings->add(new admin_setting_configselect('i3f/display',
        get_string('displayselect', 'i3f'), get_string('displayselectexplain', 'i3f'), RESOURCELIB_DISPLAY_AUTO, $displayoptions));
    $settings->add(new admin_setting_configtext('i3f/popupwidth',
        get_string('popupwidth', 'i3f'), get_string('popupwidthexplain', 'i3f'), 620, PARAM_INT, 7));
    $settings->add(new admin_setting_configtext('i3f/popupheight',
        get_string('popupheight', 'i3f'), get_string('popupheightexplain', 'i3f'), 450, PARAM_INT, 7));
}
