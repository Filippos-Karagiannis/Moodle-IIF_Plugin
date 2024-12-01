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
 * I3F module main user interface
 *
 * @package    mod_i3f
 * @copyright  2009 Petr Skoda  {@link http://skodak.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once("$CFG->dirroot/mod/i3f/lib.php");
require_once("$CFG->dirroot/mod/i3f/locallib.php");
require_once($CFG->libdir . '/completionlib.php');

$id       = optional_param('id', 0, PARAM_INT);        // Course module ID
$u        = optional_param('u', 0, PARAM_INT);         // URL instance id
$redirect = optional_param('redirect', 0, PARAM_BOOL);
$forceview = optional_param('forceview', 0, PARAM_BOOL);

if ($u) {  // Two ways to specify the module
    $url = $DB->get_record('i3f', array('id'=>$u), '*', MUST_EXIST);
    $cm = get_coursemodule_from_instance('i3f', $url->id, $url->course, false, MUST_EXIST);

} else {
    $cm = get_coursemodule_from_id('i3f', $id, 0, false, MUST_EXIST);
    $url = $DB->get_record('i3f', array('id'=>$cm->instance), '*', MUST_EXIST);
}

$course = $DB->get_record('course', array('id'=>$cm->course), '*', MUST_EXIST);

require_course_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability('mod/i3f:view', $context);

// Completion and trigger events.
i3f_view($url, $course, $cm, $context);

$PAGE->set_url('/mod/i3f/view.php', array('id' => $cm->id));

// Make sure URL exists before generating output - some older sites may contain empty urls
// Do not use PARAM_URL here, it is too strict and does not support general URIs!
$exturl = trim($url->externalurl);
if (empty($exturl) or $exturl === 'http://') {
    i3f_print_header($url, $cm, $course);
    i3f_print_heading($url, $cm, $course);
    i3f_print_intro($url, $cm, $course);
    notice(get_string('invalidstoredurl', 'i3f'), new moodle_url('/course/view.php', array('id'=>$cm->course)));
    die;
}
unset($exturl);

$displaytype = i3f_get_final_display_type($url);
if ($displaytype == RESOURCELIB_DISPLAY_OPEN) {
    $redirect = false;
}

if ($redirect && !$forceview) {
    // coming from course page or i3f index page,
    // the redirection is needed for completion tracking and logging
    $fullurl = str_replace('&amp;', '&', i3f_get_full_url($url, $cm, $course));

    if (!course_get_format($course)->has_view_page()) {
        // If course format does not have a view page, add redirection delay with a link to the edit page.
        // Otherwise teacher is redirected to the raw format of the json
        $editurl = null;
        if (has_capability('moodle/course:manageactivities', $context)) {
            $editurl = new moodle_url('/course/modedit.php', array('update' => $cm->id));
            $edittext = get_string('editthisactivity');
        } else if (has_capability('moodle/course:update', $context->get_course_context())) {
            $editurl = new moodle_url('/course/edit.php', array('id' => $course->id));
            $edittext = get_string('editcoursesettings');
        }
        if ($editurl) {
            redirect($fullurl, html_writer::link($editurl, $edittext)."<br/>".
                    get_string('pageshouldredirect'), 10);
        }
    }
    redirect($fullurl);
}

switch ($displaytype) {
    case RESOURCELIB_DISPLAY_EMBED:
        url_display_embed($url, $cm, $course);
        break;
    case RESOURCELIB_DISPLAY_FRAME:
        url_display_frame($url, $cm, $course);
        break;
    default:
        i3f_print_workaround($url, $cm, $course);
        break;
}
