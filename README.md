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
f) if a value is set to Inputs.ReplacePhoneNumbersChX (X: is channel number), all phone numbers inside this value are replaced by the
appropriate full name. The output is written to Outputs.ReplacedPhoneNumbersChX. The replacement ignores the starting
'0' and '+49' in German phone numbers. Inputs.ReplacePhoneNumbersChX can be set manually, via script or direct linked.
 For direct linking, enter the appropriate object inside settings.
g) Outputs.TodaysBirthdays shows the full name of any persons, which has birthday today.  
h) if there are multiple results at one output, the different results are separated by an HTML line break.  
 

_Up to now, the adapter was tested with exports od "Mac contacts" and "Outlook" (vCard file version 3.0)._  

###VCF Path:
* Windows: c:/data/vcard.vcf  
* Linux: /tmp/vcard.vcf  
* http: http://192.168.1.1/data/vcard.vcf  
* http (FritzBox Nas): http://192.168.1.1/nas/filelink.lua?id=164fe89123456789  


###CSS Example (for fixed column width):
**Style Header:**  
 `<style type="text/css">  
 spanVcard1 {  
 display: inline-block;  
 width: 300px;  
 }  
 </style>`  
 
**Style Prefix:**  
 `<spanVcard1>`  
 
**Style Postfix:**   
`</spanVcard1>`

**Note: Each channel needs its own tag (e.g. spanVcard1, spanVcard2, spanVcard2)!**

##Prerequirements:
- [ioBroker](http://www.ioBroker.net "ioBroker homepage")



##Change log:

###0.0.5 (2015-11-15)
* Reading contacts via http updated  
* Multiple channels subscribed to one output fixed  
* CSS Example updated

###0.0.4 (2015-11-6)  
* Missing dependency  

###0.0.3 (2015-10-25)
* Three channels for replacing numbers
* Channels can be connected to outputs of other adapters (no script needed)
* Replaced names can be formated by CSS  
* VCF files can be read via http


###0.0.2 (2015-10-02)
* Documentation updates
* Missing icon
* vcard-json issue with white spaces (inside Outlook files)

###0.0.1 (2015-09-18)
* Initial version

##LOP:  
