viewsModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "./home/home.html",
        controller : 'HomeCtrl as hc'
    });
}]);

viewsModule.controller('HomeCtrl', ['$scope', 'x2js', function($scope, x2js) {
    var vm = $scope;
    
    vm.file_changed = function(element){
        var xpdlFile = element.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
            vm.$apply(function(){
                //vm.xpdlFile = x2js.xml_str2json(reader.result); // JSON
                vm.xpdlFile = reader.result; // XML
            });
            
            function compare(a,b) {
              if (a.cor1x < b.cor1x)
                 return -1;
              if (a.cor1x > b.cor1x)
                return 1;
              return 0;
            }
            
            // CurrentArray is ordAct array
            // PreviousArray is activities array
            // find a missing activity in the flow
            function bpmn0102Val(currentArray, previousArray) {
                var results = [];
                // loop through previous array
                for(var j = 0; j < previousArray.length; j++) {
                    // look for same thing in new array
                    if (currentArray.indexOf(previousArray[j]) == -1){
                        results.push(previousArray[j]);
                        //return previousArray[j];
                    }
                }
                return results;
            }
            
            // ordered activities by transitions id
            function ordActBySeq(){
                var ordAct = [];
                for(var j=0; j<ids.length; j++){
                    for(var k=0; k<activities.length; k++){
                        if(ids[j].id == activities[k].id){
                            activities[k].to = ids[j].to;
                            ordAct.push(activities[k]);
                        }
                    }
                }
                return ordAct;
            }
            
            // repeatedName
            function style0104Val(arr){
                for(var i=0; i<arr.length-1; i++){
                    for(var j=i+1; j<arr.length; j++){
                        if(arr[i].name == arr[j].name){
                            return arr[i];
                        }
                    }
                }
                return null;
            }
            
            function style0115Val(arr){
                for(var i=0; i<arr.length; i++){
                    if(arr[i].obj){
                        if(arr[i].obj._CatchThrow == "THROW"){
                            if(!arr[i].name){
                                return arr[i];
                            }
                        }
                    }
                }
                return null;
            }
            
            var workflows = [];
            var messages = [];
            var activities = [];
            var transitions = [];
            var ids = [];
            var errors = {
                bpmn0102: [],
                style0104: [],
                style0115: [],
                style0122: [],
                style0123: []
            };
            
            var out = x2js.xml_str2json(reader.result);
            console.log(out);

            /*
            var p = out.Package.Pools.Pool;
            console.log('Numero de Pools: ' + p.length);
            for(var i=0; i<p.length; i++){
                console.log('Pool: ' + p[i]._Name);
            }
            */

            // WorkflowProcesses
            var wfp = out.Package.WorkflowProcesses.WorkflowProcess;
            console.log('Numero de WorkflowProcesses: ' + wfp.length);
            
            // Messages
            if(out.Package.MessageFlows && out.Package.MessageFlows.MessageFlow){
                var m = out.Package.MessageFlows.MessageFlow;
                for(var i=0; i<m.length; i++){
                    var msg = {
                        id:m[i]._Id, 
                        name:m[i]._Name, 
                        type:'MessageFlow', 
                        process:null, 
                        obj:null,
                        source:m[i]._Source,
                        target:m[i]._Target
                    };
                    messages.push(msg);
                }
            }
            
            for(var i=0; i<wfp.length; i++){
                
                // Transitions
                if(wfp[i].Transitions && wfp[i].Transitions.Transition){
                    console.log('WorkflowProcess Transitions ' + wfp[i]._Name + ':');
                    var t = wfp[i].Transitions.Transition;
                    console.log('Numero de Transitions: ' + t.length);
                    transitions = [];
                    for(var j=0; j<t.length; j++){
                        var cor = t[j].ConnectorGraphicsInfos.ConnectorGraphicsInfo.Coordinates;
                        //console.log('From:' + t[j]._From + ' To:' + t[j]._To);
                        transitions.push({
                            id:t[j]._Id, 
                            from:t[j]._From, 
                            to:t[j]._To, 
                            name:t[j]._Name, 
                            cor1x: cor[0]._XCoordinate,
                            cor1y: cor[0]._YCoordinate,
                            cor2x: cor[1]._XCoordinate,
                            cor2y: cor[1]._YCoordinate
                        });
                    }
                    transitions.sort(compare);
                    ids = [];
                    for(var j=0; j<transitions.length; j++){
                        if(j<transitions.length-1){
                            ids.push({id:transitions[j].from, to:transitions[j].to});
                        } else {
                            ids.push({id:transitions[j].from, to:transitions[j].to});
                            ids.push({id:transitions[j].to, to:null});
                        }
                    }
                }
                
                // Activities
                if(wfp[i].Activities && wfp[i].Activities.Activity){
                    console.log('WorkflowProcess Activities ' + wfp[i]._Name + ':');
                    var a = wfp[i].Activities.Activity;
                    console.log('Numero de Activities: ' + a.length);
                    activities = [];
                    for(var j=0; j<a.length; j++){
                        //console.log(a[j]._Name + ': ' + a[j]._Id);
                        var activity = {}, type, obj;
                        if(a[j].Event){
                            if(a[j].Event.StartEvent){
                                //console.log('StartEvent Activity');
                                type = 'StartEvent';
                                obj = a[j].Event.StartEvent;
                                
                            } else if(typeof(a[j].Event.EndEvent) == 'string'){
                                //console.log('EndEvent Activity');
                                type = 'EndEvent';
                                obj = a[j].Event.EndEvent;
                                
                            } else if (a[j].Event.IntermediateEvent){
                                if(a[j].Event.IntermediateEvent.TriggerResultMessage){
                                    // _CatchThrow (String)
                                    //console.log('TriggerResultMessage Object Activity');
                                    type = 'TriggerResultMessageObject';
                                    obj = a[j].Event.IntermediateEvent.TriggerResultMessage;
                                } else if(typeof(a[j].Event.IntermediateEvent.TriggerResultMessage) == 'string'){
                                    //console.log('TriggerResultMessage String Activity');
                                    type = 'TriggerResultMessageString';
                                    obj = a[j].Event.IntermediateEvent.TriggerResultMessage;
                                } else {
                                    //console.log('Unkknown TriggerResultMessage Activity');
                                    type = 'UnkknownTriggerResultMessage';
                                    obj = null;
                                }
                            } else {
                                //console.log('Unkknown Event Activity');
                                type = 'UnkknownEvent';
                                obj = null;
                            }  
                        } else if(a[j].Implementation){
                            //console.log('Implementation Activity');
                            type = 'Implementation';
                            obj = a[j].Implementation;
                        } else {
                            //console.log('Unkknown Activity');
                            type = 'UnkknownActivity';
                            obj = null;
                        }
                        activity = {
                            id:a[j]._Id, 
                            name:a[j]._Name,
                            process:wfp[i]._Name,
                            type: type,
                            obj: obj
                        };
                        activities.push(activity);
                    }
                    var ordAct = ordActBySeq();
                    
                    // Validaciones
                    // BPMN 0102 Validation
                    // orderedAvtivities to find missing activities
                    var go = true;
                    var results = bpmn0102Val(ordAct, activities);
                    if(results.length > 0){
                        errors.bpmn0102.push({results:results, msg:'Falta unir esta actividad en la secuancia del flujo'});
                        go = false;
                    }
                    
                    // Style 0115 Validation
                    results = style0115Val(ordAct);
                    if(results && go){
                        errors.style0115.push({results:results, msg:'Esta actividad debe tener un nombre'});
                        go = false;
                    }
                    
                    // Style 0104 Validation
                    results = style0104Val(ordAct);
                    if(results && go){
                        errors.style0104.push({results:results, msg:'Esta actividad tiene el nombre repetido'});
                    }
                    
                    // Style 0122 Validation
                    // Style 0123 Validation                    
                }
                //workflows.push({activities:activities, transitions:transitions, ids:ids});
                workflows.push({activities:activities, ids:ids});
            }
            
            vm.$apply(function(){
                vm.errors = errors;
            });
        };
        reader.readAsText(xpdlFile);
    };
}]);