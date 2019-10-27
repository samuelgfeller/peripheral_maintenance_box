// Statuses
let success = ['up', 'ok'];
let error = ['down', 'critical'];

let baseUrl = 'https://nagiosv1.rvo.one/nagios/cgi-bin/';

let urlHostlist = baseUrl + 'statusjson.cgi?query=hostlist&formatoptions=enumerate';

// Get list of hosts with their statuses
$.getJSON(urlHostlist, function (result) {
    processHostlist(result['data']['hostlist']);
});

/**
 * Loop through hosts, append them to the DOM
 * and check if they are down. If its the case
 * searchError() function is called to investigate
 *
 * @param hostlist
 */
function processHostlist(hostlist) {
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
            $("#peripheralsContainer").prepend(html);
            searchError(hostname, domId);
        }else{
            // Append host div with status (if error or not) to the container
            $("#peripheralsContainer").append(html);
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
 */
function searchError(host, domId) {

    // Get service list of host containing error
    let urlServiceList = baseUrl + 'statusjson.cgi?query=servicelist&formatoptions=enumerate&hostname=' + encodeURIComponent(host);
    $.getJSON(urlServiceList, function (result) {

        // Declare servicelist variable which is an array of services
        let servicelist = result['data']['servicelist'][host];

        // Loop through all services of the host containing an error
        $.each(servicelist, function (servicename, status) {

            // If the status of the service shows an error
            if (error.includes(status)) {

                // Get information about the faulty service
                let urlServiceInfo = baseUrl + 'statusjson.cgi?query=service&hostname=' + encodeURIComponent(host) + '&servicedescription=' + encodeURIComponent(servicename);
                $.getJSON(urlServiceInfo, function (result) {

                    // Declare serviceInfo with the information about the service
                    let serviceInfo = result['data']['service'];

                    // Append the error message to the host div
                    $('#' + domId).append(
                        '<p class="errorMsg">' +
                        'Service <b>' + serviceInfo['description'] + '</b> has following message: <b>' + serviceInfo['plugin_output'] + '</b>' +
                        '</p>'
                    );
                });

            }
        });
    });
}