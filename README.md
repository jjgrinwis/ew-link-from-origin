# 103 Early Hints via EdgeWorker

A little Akamai EdgeWorker script to get some **link** headers from the origin and feed that into the [Akamai Early Hints behavior](https://techdocs.akamai.com/property-mgr/docs/early-hints) via a [PMUSER](https://techdocs.akamai.com/property-mgr/docs/user-defined-vars) variable.
The Eary Hints behaviour works in the *client request stage* so our EdgeWorker script should be started using the *onClienRequest* event handler. The handler that is triggered when a request enters an Akamai Edge Server:

![image](https://github.com/user-attachments/assets/9f50d754-1b6c-4bb3-8bd7-12f12fb5e030)
More info about the different event handlers can be found [here](https://techdocs.akamai.com/edgeworkers/docs/event-handler-functions), and some other 103 Early Hints EdgeWorkers examples on the [Akamai Github repo.](https://github.com/akamai/edgeworkers-examples/tree/master/edgecompute/examples/103-early-hints)

## Create .edgerc credentials
If you are new to Akamai EdgeWorkers, you must create [EdgeWorkers API credentials](https://techdocs.akamai.com/edgeworkers/reference/api-get-started) as we're going to use the EdgeWorkers API to get things going.
Also, install the [Akamai CLI](https://techdocs.akamai.com/developer/docs/about-clis) with the [EdgeWorkers plugin](https://techdocs.akamai.com/edgeworkers/docs/akamai-cli). The Akamai CLI will be used in the scripts section of our package.json.

## Clone repo and setup your environment
First clone the repo and setup the environment.
```
git clone https://github.com/jjgrinwis/ew-link-from-origin.git
cd ew-link-from-origin
npm install --save-dev typescript
npm install @types/akamai-edgeworkers
mkdir dist
mkdir built
```
Now we need to get the correct groupId and create a new EdgeWorker id. <br>
First lookup your *group_id* that's the Akamai Group where your EdgeWorker script will be placed.<br> 

```
akamai edgeworkers list-groups
```
*If you are not using the default section from .edgerc, make sure to add --section <section in .edgerc> to the ```akamai edgeworkers list-groups``` command to use the section in the .edgerc file that contains the credential set*

Just modify package.json and set your groupId in the *ew_group_id* parameter of the config section. Also set the specific [resource tier](https://techdocs.akamai.com/edgeworkers/docs/resource-tier-limitations) you want to use and is part of your Akamai contract.

- 100:Basic Compute
- 200:Dynamic Compute
- 300:Enterprise Compute

*If you don't have EdgeWorkers enabled on your contract, just add it via the free [evaluation tier](https://techdocs.akamai.com/edgeworkers/docs/add-edgeworkers-to-contract) in the Akamai marketplace.*


When you have set your group_id and the correct resource tier, let's generate an edgeworker id:
```
npm run create-ew-id
```
This will create your unique EdgeWorker ID in your environment and selected group. Add the created EdgeWorker ID to the *ewid* parameter which can be found in the config section of package.json.

## Activate this EdgeWorker
Feel free to make changes but after your are done, just run 
```
npm run build
```
This will run some scripts and will upload your EdgeWorker package in your account and will activate it on Akamai staging platform by default.
When this is done, just update your CDN delivery configuration to start this EdgeWorker based on certain criteria and don't forget to set the Early Hints using the pre-created PMUSER var. :wink:

![image](https://github.com/user-attachments/assets/58466b1b-9eaa-4548-8726-4a550b503de2)

You should now see your early hints coming from your Link headers from your origin, something like this:

![image](https://github.com/user-attachments/assets/35ce6363-2ba7-41c2-a037-43bdd67e0b33)

When you have updated the page that you use to serve the Link headers, just purge it from cache so new version will be fetched and cached. Below the example where we used a separate CPcode for the page that serves the link headers and we invalidate the cache.
```
akamai purge invalidate --cpcode 123456
```
### Debugging
If you need to do some EdgeWorker debugging, just generate an EdgeWorker debug token.
```
npm run generate-token
```
You can use that token in the Akamai-EW-Trace request header together with other [EdgeWorkers Pragma debug headers](https://techdocs.akamai.com/edgeworkers/docs/enable-enhanced-debug-headers) like *akamai-x-ew-debug-subs* 
```
$ http https://api.grinwis.com/items/1000 Akamai-EW-Trace:eyJ0e.. Pragma:akamai-x-ew-debug-subs -h | grep -i request

X-Akamai-Edgeworker-Subrequests: ew=95367; evt=CReq; id=1; method=GET; url="https://api.grinwis.com/items/1000"; rsp=200; dur=4
X-Akamai-EdgeWorker-onClientRequest-Info: ew=95367 v0.0.21:ew-early-hints; status=Success; status_msg=-; res_tier=200; init_wall_time=0; wall_time=4.412; init_cpu_time=0; cpu_time=0.266; memory_usage=1540; continue_on_error=off
```
