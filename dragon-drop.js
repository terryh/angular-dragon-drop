/*
 * angular-dragon-drop v0.0.1
 * (c) 2013 Brian Ford http://briantford.com, TerryH
 * License: MIT
 */

'use strict';

angular.module('btford.dragon-drop', []).
  directive('btfDragon', function ($document, $compile) {
  // https://github.com/btford/angular-dragon-drop/blob/master/dragon-drop.js#L37
  // sorry kill the dragon, now dragon in soul
  var dragValue,
      dragOrigin,
      dragValueIndex,
      offsetOrigin,
      floaty;

    var drag = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();

      // normalize the event
      var orig = ev.originalEvent
      //console.log(orig);
      var event = orig.touches ? orig.touches[0] : orig;

      var x = event.clientX,
        y = event.clientY;

      //floaty.css({
        //top: y - offsetOrigin.y,
        //left: x - offsetOrigin.x
      //});
      //console.log("X: " + x);
      //console.log("Y: " + y);
      floaty.css('left', x + 5 + 'px');
      floaty.css('top', y + 5 + 'px');
    };

    return {
      restrict: 'A',
      terminal: true,
      link: function (scope, elt, attr) {

        // get the `thing in things` expression
        var expression = attr.btfDragon;
        var dragLimit = attr.limit;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*$/);
        if (!match) {
          throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
            expression + "'.");
        }
        var lhs = match[1];
        var rhs = match[2];

        // pull out the template to re-use. Improvised ng-transclude.
        var template = elt.html().trim();
        elt.html('');
        var child = angular.element('<div ng-repeat="' + lhs + ' in ' + rhs + '">' + template + '</div>');
        elt.append(child);

        $compile(child)(scope);

        var spawnFloaty = function () {
          scope.$apply(function () {
            floaty = angular.element('<div style="position: fixed;">' + template + '</div>');
            floaty.css({"z-index":1});
            // clearance check
            if (dragValue) {
              var floatyScope = scope.$new();
              floatyScope[lhs] = dragValue;
              $compile(floaty)(floatyScope);
              angular.element(document.body).append(floaty);

            }
          });

          $document.bind('touchmove mousemove', drag);
          //floaty.bind('touchmove mousemove', drag);
        };

        var killFloaty = function () {
          $document.unbind('touchmove mousemove', drag);
          //floaty.bind('touchmove mousemove', drag);
          if (floaty) {
            floaty.remove();
            floaty = null;
          }
        };

        elt.bind('touchstart mousedown', function (ev) {
          if (dragValue) {
            return;
          }
          // normalize the event
          var orig = ev.originalEvent
          var event = orig.touches ? orig.touches[0] : orig;

          var targetElem = angular.element(ev.target);
          scope.$apply(function () {
            var targetScope = angular.element(ev.target).scope();
            var value = dragValue = targetScope[lhs];
            console.log("Scope value "+ value);
            if(value){
              // count offset
              var orig = targetElem.position();

              offsetOrigin = {
                x: event.pageX - orig.left,
                y: event.pageY - orig.top
              }

              var list = scope.$eval(rhs);
              dragOrigin = list;
              var valueIndex = dragValueIndex = list.indexOf(value);
              list.splice(list.indexOf(value), 1);
            }
          });
          spawnFloaty();
          drag(ev);
        });

        // handle something being dropped here
        elt.bind('touchend mouseup', function (ev) {
          if (dragValue) {
            scope.$apply(function () {
              var list = scope.$eval(rhs);
              list.push(dragValue);
              console.log("END pushto "+ dragValue);
              dragValue = dragOrigin = offsetOrigin = null;
            });
          }
          killFloaty();
        });

        // else, the event bubbles up to document
        //$document.bind('touchend mouseup', function (ev) {
          //console.log("Document END", dragValue);
          //if (dragValue) {
            //scope.$apply(function () {
              ////dragOrigin.push(dragValue);
              //dragOrigin.splice(dragValueIndex, 0, dragValue);
              //dragValue = dragOrigin = offsetOrigin  = null;
            //});
            //killFloaty();
          //}
        //});

      }
    };
  });
