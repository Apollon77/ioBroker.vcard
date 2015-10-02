#vCard Adapter for ioBroker

##Description:

The main focus of vCard adapter is, to replace the phone numbers of ioBroker.fritzBox adapter's outputs.

This adapter reads a vCard file and offers the possibility to:

a) output of names (full names) on Outputs.FilteredFullNames.  
b) output of email addresses on Outputs.FilteredEmailAddresses.  
c) output of postal addresses on Outputs.FilteredPostalAddresses.  
d) output of email addresses on Outputs.FilteredEmailAddresses.
e) the output of a)b)c) and d) can be triggered by setting a search pattern (which is performed on full name)to 
Inputs.Filter. This filter works case in-sensitive.  
f) if a value is set to Inputs.ReplacePhoneNumbers, all phone numbers inside this value are replaced by the 
appropriate full name. The output is written to Outputs.ReplacedPhoneNumbers. Thr replacement ignores the starting 
'0' and '+49' in German phone numbers.  
g) Outputs.TodaysBirthdays shows the full name of any persons, which has birthday today.  
h) if there are multiple results at an output, the different results are separated by an HTML line break.  

_Up to now, the adapter was tested with "Mac contacts" (vCard file version 3.0)._  

##Prerequirements:
- [ioBroker](http://www.ioBroker.net "ioBroker homepage")

- vcard-json (version >= 0.4.0), in older versions, there is an error regarding email addresses
- node-schedule (version >= 0.2.9

##Change log:

0.0.2 (2015-10-02)  
* Documentation updates
* Missing icon
* vcard-json issue with white spaces (inside Outlook files)

0.0.1 (2015-09-18)  
* Initial version

##LOP:  
* Open file via http