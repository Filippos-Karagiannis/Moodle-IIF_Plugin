/**
 * Make search and retrieve operations
 *
 * @module     mod_i3f/queries-sru
 * @package    mod_i3f
 * @copyright  2020 Filippos Karagiannis
 */
define("mod_i3f/sruquery", ["jquery"], function ($) {
  return {
    init: function () {
      var init = function (evt) {
        var maxrecords;
        var startrecord = 1;
        var sortsel = "relevance";
        var ordersel = "asc";
        var goflag = 0;
        var backflag = 0;
        var goflagcheck = 1;
        var backflagcheck = 1;
        var sort = "+sortBy+relevance";
        var order = "%2Fasc";
        var container = $("#fitem_id_build_form");
        var pluginfile_url = $('form.mform input[name="pluginfile_url"]').val();
        var link = "https://visuallibrary.net/sru?operation=explain";
        $.ajax({
          url: pluginfile_url,
          method: "POST",
          cache: false,
          data: { link: link },
        }).done(function (data) {
          data = data;
          console.log(data);
          data = $.parseXML(data);
          var search_form_table = $(
            '<table id="searchformMetadata" style="border-collapse: collapse" />'
          );
          /**
           * Trim Xml according to supported searches
           */
          var search_relations = $(data).find("zr\\:configInfo");
          var skipsearches = $(search_relations)
            .find("zr\\:default[type='skipInSearchForm']")
            .text();
          skipsearches = skipsearches.split(",");
          $(data)
            .find("zr\\:indexInfo zr\\:index")
            .each(function (_, unsupported) {
              if ($.inArray($(unsupported).attr("id"), skipsearches) > 0) {
                $(unsupported).remove();
              }
            });
          //-------------------------------------------------------

          /**
           * build the form
           */
          console.log(data);
          search_form_table.append(
            "<tr>" +
              '<th align="left" style="padding-bottom: 20px;padding-right: 8px;">Relation</th>' +
              '<th align="left" style="padding-bottom: 20px;">Search in</th>' +
              '<th align="left" style="padding-bottom: 20px;">Term</th>' +
              "</tr>"
          );
          var search_indices = $(data).find(
            "zr\\:index zr\\:map:first-child zr\\:name"
          );
          console.log(skipsearches);
          search_indices.each(function (i, field_row) {
            function optionvalue(o) {
              return $(o).attr("set") + "." + $(o).text();
            }
            var row_optionvalue = optionvalue(field_row);
            i++;
            var select = $(
              '<select class="sruIndex"' +
                'id="index' +
                i +
                '" name="index' +
                i +
                '" />'
            );
            search_indices.each(function (_, field_option) {
              var option = $("<option/>");
              option.val(optionvalue(field_option));
              option.text($(field_option).text());
              if (optionvalue(field_option) == row_optionvalue) {
                option.attr("selected", "selected");
              }
              select.append(option);
            });
            var relation_select = $(
              '<select class="sruBool" name="bool' + i + '"/>'
            );
            var relation_selected = $(
              search_relations.find("zr\\:default[type='booleanOperator']")
            );
            var relation_cell = $("<td/>");
            if (relation_selected.length != 0) {
              search_relations
                .find("zr\\:supports[type='booleanOperator']")
                .each(function (_, relation) {
                  var relation_option = $("<option/>");
                  var relation_text = $(relation).text();
                  relation_option.val(relation_text);
                  relation_option.text(relation_text);
                  if (relation_option.text() == relation_selected.text()) {
                    relation_option.attr("selected", "selected");
                  }
                  relation_select.append(relation_option);
                  return relation_select;
                });
            }
            var relation_cell = $("<td/>");
            var select_cell = $("<td/>");
            var row = $("<tr/>");
            relation_cell.append(relation_select);
            select_cell.append(select);
            row.append(relation_cell);
            row.append(select_cell);
            var input_cell = $("<td/>");
            var inputfield = $(
              '<input type="text" name="term' +
                i +
                '" maxlength="2069" value="" size="30" />'
            );
            input_cell.append(inputfield);
            row.append(input_cell);
            search_form_table.append(row);
          });
          container.append(search_form_table);
          $("[name='bool1']").remove();
        });
        //-------------------------------------------------------

        /**
         * build a list with results from query search
         */
        $("#id_search_vl").click(function search(evt) {
          //evt.preventDefault();
          var baseurl = "https://visuallibrary.net";
          link = baseurl + "/sru?operation=searchRetrieve&query=%28";
          var flag = 0;
          var boolrelation;
          var indexval;
          $("input[name^='term']").each(function (i, termfilled) {
            i++;
            indexval = $("[name = 'index" + i + "']").val() + "%3D";
            boolrelation = $("[name = 'bool" + i + "']").val() + "+";
            if ($(termfilled).val().indexOf(" ") >= 0) {
              if ($(termfilled).val() && flag == 1) {
                link +=
                  "+" +
                  boolrelation +
                  indexval +
                  "%28" +
                  $(termfilled).val() +
                  "%29";
              }
              if ($(termfilled).val() && flag == 0) {
                link += indexval + "%28" + $(termfilled).val() + "%29";
                flag = 1;
              }
            } else {
              if ($(termfilled).val() && flag == 1) {
                link += "+" + boolrelation + indexval + $(termfilled).val();
              }
              if ($(termfilled).val() && flag == 0) {
                link += indexval + $(termfilled).val();
                flag = 1;
              }
            }
          });
          link = link.split(" ").join("+");
          link += "%29";
          link += sort + order;
          link += "&format=json";
          if (goflag == goflagcheck) {
            link += "&startRecord=" + (startrecord + 10);
            goflagcheck++;
          } else if (backflag == backflagcheck) {
            link += "&startRecord=" + (startrecord - 10);
            backflagcheck++;
          } else {
            link += "&startRecord=" + startrecord;
          }
          console.log(link);
          $.ajax({
            url: pluginfile_url,
            method: "POST",
            cache: false,
            data: { link: link },
          }).done(function (data) {
            $("#searchformMetadata:first + ul#searchResult").remove();
            $("#forward").remove();
            $("#back").remove();
            $("#sortby").remove();
            $("#orderby").remove();
            $("ul#searchResult").remove();
            $("#searchformMetadata:first").append(
              "<button type='button' id='back'><---</button> <button type='button' id='forward'>---></button>"
            );
            $("#searchformMetadata:first").append(
              "<select name='sort' id='sortby'><option value='relevance'>Relevance</option><option value='dc.title'>Title</option><option value='bib.personalName'>Author / Collaborator</option><option value='bib.originPlace'>Place</option><option value='vl.printer-publisher'>Printer / Publisher</option><option value='dc.date'>Year</option></select>"
            );
            $("#searchformMetadata:first").append(
              "<select name='order' id='orderby'><option value='asc'>Ascending</option><option value='desc'>Descending</option>"
            );
            $("#sortby").val(sortsel).prop("selected", true);
            $("#orderby").val(ordersel).prop("selected", true);
            var search_result = data;
            search_result = jQuery.parseJSON(search_result);
            console.log(search_result);
            maxrecords = search_result.searchRetrieveResponse.numberOfRecords;
            startrecord =
              search_result.searchRetrieveResponse.echoedSearchRetrieveRequest
                .startRecord;
            $("#forward").click(function () {
              if (startrecord + 10 <= maxrecords) {
                goflag++;
                search();
              }
            });

            $("#back").click(function () {
              if (startrecord - 10 >= 0) {
                backflag++;
                search();
              }
            });

            $("#sortby").change(function () {
              sortsel = $(this).val();
              sort = "+sortBy+" + sortsel;
              search();
            });

            $("#orderby").change(function () {
              ordersel = $(this).val();
              order = "%2F" + ordersel;
              search();
            });

            if (maxrecords == 0) {
              $("#searchformMetadata:first + ul#searchResult").remove();
              $("#forward").remove();
              $("#back").remove();
              $("#sortby").remove();
              $("#orderby").remove();
              $(
                "<ul class='listres' id=searchResult>this query yielded no results </ul>"
              ).insertAfter("#searchformMetadata");
            }
            var list = $("<ul class='listres' id='searchResult'/>");
            var button_html = '<div class="clickme">Import</div>';
            $.each(search_result.searchRetrieveResponse.records, function (i) {
              var title =
                search_result.searchRetrieveResponse.records[i].metadata.title;
              var subtext =
                search_result.searchRetrieveResponse.records[i].metadata
                  .subtitle;
              var writer =
                search_result.searchRetrieveResponse.records[i].metadata.author;
              var place =
                search_result.searchRetrieveResponse.records[i].metadata.origin;
              var id =
                search_result.searchRetrieveResponse.records[i].href.match(
                  /(\d+)(?!.*\d)/
                );
              var im_id =
                search_result.searchRetrieveResponse.records[i].op_ot_id;
              var listitem = $("<li class='items'/>");
              var image =
                "<a class='thumb' href='/ihd4/content/titleinfo/" +
                id[0] +
                "'><img src='" +
                baseurl +
                "/static/graphics/clpx.gif' style='width:76.8px;height:116px;background-image:url(https://visuallibrary.net/s2wpihd/download/webcache/128/" +
                im_id +
                ");'></a>";
              var thumbnail = $("<div>" + image + "</div>");
              listitem.append(thumbnail);
              var head =
                "<h3 class='titles'><a href=" +
                baseurl +
                "/ihd/content/titleinfo/" +
                id[0] +
                ">" +
                title +
                "</a></h3>";
              listitem.append(head);
              if (subtext != undefined) {
                var details =
                  "<div>" +
                  subtext +
                  "</div> <div>" +
                  writer +
                  "</div> <div>" +
                  place +
                  "</div>";
              } else {
                var details =
                  "<div>" + writer + "</div> <div>" + place + "</div>";
              }
              listitem.append(details);
              var button = $(button_html);
              var i3f = baseurl + "/i3f/v20/" + id[0] + "/manifest";
              listitem.append(button);
              button.click(function (evt) {
                evt.preventDefault();
                $("#id_externalurl").val(i3f);
                $("#id_intro").click();
              });
              list.append(listitem);
            });
            $(list).insertAfter("#searchformMetadata");
          });
        });
      };
      $("#id_build_form").click(function (evt) {
        $("#searchformMetadata").remove();
        $("#searchResult").remove();
        init();
      });
    },
  };
});
