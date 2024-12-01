/**
 * Validate i3f link
 *
 * @module     mod_i3f/validation
 * @package    mod_i3f
 * @copyright  2020 Filippos Karagiannis
 */
define(["jquery"], function ($) {
  return {
    init: function () {
      document
        .getElementById("id_intro")
        .addEventListener("click", function () {
          //adding an event listener for the button so when its clicked it calls the function
          var i3f = document.getElementById("id_externalurl").value; //assigning the string from the textbox to a variable
          var contents, x;
          // var baseur = /^(https?:\/\/[^\/]+)\//.exec(i3f);

          if (i3f == "") {
            alert("please include a IIIF link");
          } else if (
            !(
              document.getElementById("id_language_1").checked ||
              document.getElementById("id_language_2").checked ||
              document.getElementById("id_language_3").checked
            )
          ) {
            alert("please select a language");
          }
          try {
            if (document.getElementById("id_language_1").checked) {
              $.getJSON(i3f, { lang: "en" }, function (data) {
                for (i in data.metadata) {
                  x +=
                    "<div>" +
                    "<strong>" +
                    data.metadata[i].label +
                    " : " +
                    "</strong>";
                  for (j in data.metadata[i].value) {
                    x += data.metadata[i].value[j];
                  }
                }
                x = x.replace(/undefined/g, ""); //if it works it ain't stupid (temporary)
                document.getElementById("id_introeditoreditable").innerHTML = x; // this works if the paragraph element is magically dissapeared
                //currentcontent=$("#id_introeditoreditable").find("p").innerHTML(x);
                for (i in data.metadata) {
                  if (data.metadata[i].label.includes("Title")) {
                    contents = data.metadata[i].value;
                  }
                  if (data.metadata[i].label.includes("Date")) {
                    contents += " : " + data.metadata[i].value;
                  }
                }
                document.getElementById("id_name").value = contents;
              });
            }

            if (document.getElementById("id_language_2").checked) {
              $.getJSON(i3f, { lang: "de" }, function (data) {
                for (i in data.metadata) {
                  x +=
                    "<div>" +
                    "<strong>" +
                    data.metadata[i].label +
                    " : " +
                    "</strong>";
                  for (j in data.metadata[i].value) {
                    x += data.metadata[i].value[j];
                  }
                }
                x = x.replace(/undefined/g, "");
                document.getElementById("id_introeditoreditable").innerHTML = x;

                for (i in data.metadata) {
                  if (data.metadata[i].label.includes("Titel")) {
                    contents = data.metadata[i].value;
                  }
                  if (data.metadata[i].label.includes("Entstehung")) {
                    contents += " : " + data.metadata[i].value;
                  }
                }
                document.getElementById("id_name").value = contents;
              });
            }

            if (document.getElementById("id_language_3").checked) {
              $.getJSON(i3f, { lang: "it" }, function (data) {
                for (i in data.metadata) {
                  x +=
                    "<div>" +
                    "<strong>" +
                    data.metadata[i].label +
                    " : " +
                    "</strong>";
                  for (j in data.metadata[i].value) {
                    x += data.metadata[i].value[j];
                  }
                }
                x = x.replace(/undefined/g, "");
                document.getElementById("id_introeditoreditable").innerHTML = x;

                for (i in data.metadata) {
                  if (data.metadata[i].label.includes("Titolo")) {
                    contents = data.metadata[i].value;
                  }
                  if (data.metadata[i].label.includes("Data")) {
                    contents += " : " + data.metadata[i].value;
                  }
                }
                document.getElementById("id_name").value = contents;
              });
            }
          } catch (error) {
            console.error(
              "There has been a problem with your json operation:",
              error
            );
          }
        });
    },
  };
});
