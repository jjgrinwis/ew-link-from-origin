/*
c) Copyright 2025 Akamai Technologies, Inc. Licensed under Apache 2 license.
Purpose: Get multiple link headers and add them so PMUSER var to be used with early hints behavior.

This needs to run in the onClienRequest stage, that's where the early-hints behavior is used.
It only needs to start where it makes sense, so don't start this one static objects.
Also make sure to cache the EdgeWorker httpRequest in you delivery configuration to speedup the request.
*/

import { httpRequest } from "http-request";
import { logger } from "log";

// our page we're using to lookup all the link headers, should be cached in delivery config!
// this might also be moved to PMUSER var so it can be set in the delivery config.
const LINK_PAGE = "/items/1000";

export async function onClientRequest(request: EW.IngressClientRequest) {
  /*
  Just do a call to the origin (ignoring the request headers for now).
  Cache this in your delivery configuration for edgeWorker sub-requests calls with separate cpcode so it can be purged.

  This is the perf. optimized version always calling same page with contains the link headers and not ${request.url}
  */

  try {
    // our optimized version always requesting same LINK_PAGE. Should be cached!
    const linkHeaders = (
      await httpRequest(`https://${request.host}${LINK_PAGE}`, {
        timeout: 2000,
      })
    ).getHeader("link");

    // set early hints var to be used in the behavior if it's not null
    if (linkHeaders) {
      request.setVariable("PMUSER_EARLY_HINTS", linkHeaders.join(", "));
    }
    // in case anything goes wrong, just log an error, that's it.
  } catch (error) {
    logger.log("Error fetching link headers:", error);
  }
}
