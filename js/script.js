// Statuses
let success = ['up', 'ok'];
let error = ['down', 'critical'];

// Declare statusHash which is a string of the statuses and if it changes the dom is reloaded
let newStatusHash = '';
let oldStatusHash = '';

let baseUrl = 'https://nagiosv1.rvo.one/nagios/cgi-bin/';

// Boolean true if its the first execution after page load. Changed to false after the use of it
let firstExecution = true;

// Call the function for the first time
getServiceAndHostList(true);

// Refresh the whole thing every 30 sec
window.setInterval(function () {
    let statusChanged = false;

    if (firstExecution) {
        oldStatusHash = newStatusHash;
        firstExecution = false;
    }
    // console.log('old' + oldStatusHash, 'new' + newStatusHash);

    if (oldStatusHash !== newStatusHash) {
        oldStatusHash = newStatusHash;
        statusChanged = true;

        // Empty the container to populate with refreshed data
        $("#peripheralsContainer").empty();
    }

    // Reset newStatusHash
    newStatusHash = '';
    // Call the function every 30 sec
    getServiceAndHostList(statusChanged);

}, 30000);

/**
 * Get servicelist form nagios and engage future execution
 *
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function getServiceAndHostList(statusChanged) {

    // Get list of hosts with their services
    let urlServiceList = baseUrl + 'statusjson.cgi?query=servicelist&formatoptions=enumerate';
    $.getJSON(urlServiceList, function (result) {
        processServiceAndHostList(result['data']['servicelist'], statusChanged);
    });

}

/**
 * Loop through hosts, then to their serivces
 * append them to the DOM and check if they are faulty.
 * If its the case
 * searchError() function is called to investigate
 *
 * @param serviceAndHostList string
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function processServiceAndHostList(serviceAndHostList, statusChanged) {

    // Declare i which is counted up and will be part of the hostId
    let i = 1;

    // Loop through all
    $.each(serviceAndHostList, function (hostname, serviceList) {

        let faultyServices = [];
        let errorClass = '';

        $.each(serviceList, function (serviceName, status) {
            // Check if success array has the returned status which would mean that its not faulty
            if (error.includes(status)) {
                // Add the faulty service to the array
                faultyServices.push(serviceName);

                // If one service is faulty the whole host should appear with a red dot
                errorClass = 'red';
            }
        });

        // Declare variable which is the dom id of the host div
        let domId = 'host' + i;

        // Declare var which contains the host html
        let html = '<div class="peripheralDiv" id="' + domId + '">' +
            '<h1 class="hostname">' + hostname + '</h1>' +
            '<span class="dot ' + errorClass + '"></span>' +
            '</div>';

        // (Javascript runs asynchronously so the error is investigated and appended only after hosts got loaded in DOM)
        if (faultyServices.length > 0) {

            // Add 1 to hash to say that its down
            // Added at first position because we prepend the element so it comes first at that time
            newStatusHash = '1' + newStatusHash;

            // If status changed
            if (statusChanged) {
                // Add html to the top of the container because it's faulty and has to be displayed before all
                $("#peripheralsContainer").prepend(html);
            }

            // Call function to search the error
            searchError(hostname, faultyServices, domId, statusChanged);
        } else {

            // Add 0 to hash to say that its up
            newStatusHash += '0';

            // If status changed
            if (statusChanged) {

                // Append host div with status (if error or not) to the container
                $("#peripheralsContainer").append(html);
            }
        }

        // Add 1 to the value of i
        i++;
    });
}

/**
 * If the at least one service is down, the error has to be
 * displayed. This function goes through all faulty services
 * from a host and appends the error message below
 * the host div in DOM
 *
 * @param host string hostname
 * @param faultyServices
 * @param domId string id of faulty host div
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function searchError(host, faultyServices, domId, statusChanged) {
    // Loop through all services of the host containing an error
    $.each(faultyServices, function (key, serviceName) {

        // Status on all services also added to the hash because if faulty service changes the page
        // has to be updated too. The faulty host status nr is prepended to the hash and here it's after
        // This is not relevant since it will be the same logic in every execution and to find if something
        // changed it does the job
        newStatusHash += '1';

        // Get information about the faulty service
        let urlServiceInfo = baseUrl + 'statusjson.cgi?query=service&hostname=' + encodeURIComponent(host) + '&servicedescription=' + encodeURIComponent(serviceName);
        $.getJSON(urlServiceInfo, function (result) {

            // Declare serviceInfo with the information about the service
            let serviceInfo = result['data']['service'];

            // If status changed
            if (statusChanged) {

                // Append the error message to the host div
                $('#' + domId).append(
                    '<p class="errorMsg">' +
                    'Service <b>' + serviceInfo['description'] + '</b> has following message: <b>' + serviceInfo['plugin_output'] + '</b>' +
                    '</p>'
                );
            }
        });
    });
}