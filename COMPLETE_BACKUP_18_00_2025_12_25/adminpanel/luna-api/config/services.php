<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'google' => [
        'translate_key' => env('GOOGLE_TRANSLATE_API_KEY', null),
    ],

    'agora' => [
        'app_id' => env('AGORA_APP_ID', null),
        'app_certificate' => env('AGORA_APP_CERTIFICATE', null),
    ],

];
