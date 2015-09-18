vCard Adapter for ioBroker

The main focus of vCard adapter is, to replace the phone numbers of ioBroker.fritzBox adapter's outputs.

This adapter reads a vCard file and offers the possibility to:

a) output of names (full names) on Outputs.FilteredFullNames. 
b) output of email addresses on Outputs.FilteredEmailAddresses. 
c) output of postal addresses on Outputs.FilteredPostalAddresses.
d) output of email addresses on Outputs.FilteredEmailAddresses.

e) the output of a)b)c) and d) can be triggered by setting a search pattern (which is performed on full name)to Inputs.Filter.
 This filter works case in-sensitive.
 
f) if a value is set to Inputs.ReplacePhoneNumbers, all phone numbers inside this value are replaced by the appropriate full name. 
The output is written to Outputs.ReplacedPhoneNumbers. Thr replacement ignores the starting '0' and '+49' in German phone numbers.

g) Outputs.TodaysBirthdays shows the full name of any persons, which has birthday today.

h) if there are multiple results at an output, the different results are separated by an "<br>".


Up to now, the adapter was tested with "Mac contacts" (vCard file version 3.0).

Prerequirements:
- ioBroker
- vcard-json (version >= 0.4.0), in older versions, there is an error regarding email addresses
- node-schedule (version >= 0.2.9