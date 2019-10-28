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
getHostlist(true);

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
    newStatusHash = '';
    // Call the function every 30 sec
    getHostlist(statusChanged);

}, 30000);

/**
 * Get hostlist form nagios and engage future execution
 *
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function getHostlist(statusChanged) {

    // Get list of hosts with their statuses
    let urlHostlist = baseUrl + 'statusjson.cgi?query=hostlist&formatoptions=enumerate';
    $.getJSON(urlHostlist, function (result) {
        processHostlist(result['data']['hostlist'], firstExecution, statusChanged);
    });
}

/**
 * Loop through hosts, append them to the DOM
 * and check if they are down. If its the case
 * searchError() function is called to investigate
 *
 * @param hostlist string
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function processHostlist(hostlist, statusChanged) {
    // Declare i which is counted up and will be part of the hostId
    let i = 1;

    // Loop through all
    $.each(hostlist, function (hostname, status) {
        let isDown = true;
        let errorClass = 'red';

        // Check if success array has the returned status which would mean that its not faulty
        if (success.includes(status)) {

            // isDown boolean is set to false because it's not an error
            isDown = false;

            // errorClass is set to an empty string because it's not an error
            errorClass = '';
        }

        // Declare variable which is the dom id of the host div
        let domId = 'host' + i;

        // Declare var which contains the host html
        let html = '<div class="peripheralDiv" id="' + domId + '">' +
            '<h1 class="hostname">' + hostname + '</h1>' +
            '<span class="dot ' + errorClass + '"></span>' +
            '</div>';

        // Javascript runs asynchronously so the error is investigated and appended only after hosts got loaded in DOM
        if (isDown) {

            // Add 1 to hash to say that its down
            // Added at first position because we prepend the element so it comes first at that time
            newStatusHash = '1' + newStatusHash;

            // If status changed
            if (statusChanged) {
                // Add html to the top of the container because it's faulty and has to be displayed before all
                $("#peripheralsContainer").prepend(html);
            }
            // Call function to search the error
            searchError(hostname, domId, statusChanged);
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
 * If the host is down, the error has to be found
 * This function goes through all services from a host,
 * finds the faulty one and appends the error message below
 * the host in DOM
 *
 * @param host string hostname
 * @param domId string id of faulty host div
 * @param statusChanged boolean true if the status have changed and though the dom elements have to be updated
 */
function searchError(host, domId, statusChanged) {

    // Get service list of host containing error
    let urlServiceList = baseUrl + 'statusjson.cgi?query=servicelist&formatoptions=enumerate&hostname=' + encodeURIComponent(host);
    $.getJSON(urlServiceList, function (result) {

        // Declare servicelist variable which is an array of services
        let servicelist = result['data']['servicelist'][host];

        // Loop through all services of the host containing an error
        $.each(servicelist, function (servicename, status) {

            // If the status of the service shows an error
            if (error.includes(status)) {

                // Status on all services also added to the hash because if faulty service changes the page
                // has to be updated too. The faulty host status nr is prepended to the hash and here it's after
                // This is not relevant since it will be the same logic in every execution and to find if something
                // changed it does the job
                newStatusHash += '1';

                // Get information about the faulty service
                let urlServiceInfo = baseUrl + 'statusjson.cgi?query=service&hostname=' + encodeURIComponent(host) + '&servicedescription=' + encodeURIComponent(servicename);
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

            } else {
                // Add 0 to say that service isn't faulty
                newStatusHash += '0';
            }
        });
    });
}