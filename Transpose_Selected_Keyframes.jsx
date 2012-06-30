{
	/* 	Transposes (moves) selected layer property keyframes to current time position with entered key step.
	*	Only removes keyframes and re-create them in new timeline positions with stored values, so, interpolation types, 
	*	spatial continuity, tangent vectors and other keyframe data is not supported.
	* 	Questions? https://github.com/RomanZander/ae-transpose-selected-keyframes/
	*/
	
    clearOutput();
    var scriptVersion = "0.5";
    var scriptName = "Transpose Selected Keyframes";
    var keyStepPrompt = "Transposing selected property keyframes to current time position\rEnter key step (in frames):";
    var errorSelectionMessage = "ERROR: Can't transpose.\rSelect single layer property with keyframes in composition";
    var errorStepMessage = "ERROR: Key step must be integer from 1 to bigger";
    var storedTimes = new Array(); 
    var storedValues = new Array(); 
    var storedNumKeys = 0;
	var storedTime = 0;
	var storedFrameDuration = 0;
    
    function alertMessage(msgText)  {
        alert(String(msgText), scriptName + '  v.' + scriptVersion);
        }
    function infoMessage(msgText)  {
        writeLn(scriptName + '> ' + String(msgText))
        }
    function storeKeyFrames(propertiesCollection) {
        for (var i = 1; i <= propertiesCollection.numKeys; i++) {
            if (propertiesCollection.keySelected(i)) {
                storedTimes[i] = propertiesCollection.keyTime(i);
                storedValues[i] = propertiesCollection.keyValue(i);
                }
            else {
                storedTimes[i] = false;
                storedValues[i] = false;
                }
            }
        }
    function removeKeyFrames(propertiesCollection) {
        for (var i = 1, iStored = 1; i <=  propertiesCollection.numKeys; i++, iStored++) {
            if (storedTimes[iStored] != false) {
                propertiesCollection.removeKey(i);
                i--;
                }
            }
        }
    function restoreKeyFrames(propertiesCollection) {
		var restoreStepMultiplier = 0;
        for (var i = 1; i <=  storedNumKeys; i++) {
			if (storedTimes[i] != false) {
				propertiesCollection.setValueAtTime(((keyStep*storedFrameDuration)*restoreStepMultiplier+storedTime), storedValues[i]);
				restoreStepMultiplier++;
				}
            }
		infoMessage(String(restoreStepMultiplier) + ' keys transposed');
        }
    
    // Initial state testing
    if (app.project && 
        app.project.activeItem && 
        app.project.activeItem instanceof CompItem &&
        (app.project.activeItem.selectedLayers.length == 1) &&
        (app.project.activeItem.selectedProperties.length == 1) &&
        (app.project.activeItem.selectedProperties[0] instanceof Property) &&
        (app.project.activeItem.selectedProperties[0].numKeys > 0)
        ) 
        {
            // preparing
            var compFrameRate = app.project.activeItem.frameRate;
            var compFrameDuration = app.project.activeItem.frameDuration;
            var selectedPropertiesCollection = app.project.activeItem.selectedProperties[0];
            var storedKeyFrames = new Array();
			// request desired key step
            var keyStep = parseInt(prompt (keyStepPrompt, 1, scriptName + '  v.' + scriptVersion), 10);
			// complete calculations
			storedNumKeys = selectedPropertiesCollection.numKeys;
			storedTime = app.project.activeItem.time;
			storedFrameDuration = app.project.activeItem.frameDuration;
			
			// check entered
            if (
                (keyStep != NaN) &&
                (keyStep >= 1)
                )
                {
					app.beginUndoGroup(scriptName);
                    // processing
					storeKeyFrames(selectedPropertiesCollection);
                    removeKeyFrames(selectedPropertiesCollection);
                    restoreKeyFrames(selectedPropertiesCollection);
                    //
                    app.endUndoGroup();
                }
            else {
                alertMessage (errorStepMessage);
                }
        }
    else {
        alertMessage (errorSelectionMessage);
        }
}
