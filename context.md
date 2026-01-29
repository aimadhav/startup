I am building an mvp version of a falshcard app called cramit. It is a flashcard app that uses spaced repetion on mostly premade decks(right now later we will impletment card creation and editing too) for studnets focusing on a competitive exam.


tech stack i will be using is react native, watermelon db ,supabase(as cloud for getting and syncing data)
ts-fsrs libarary,native wind,zustand for state managment(do we need it watermmelon db?)


for fronteend i have a vague idea of  how it should look like dont have all the screenns but home , library and stats page i stored the mocks in photos folder
there would be more screens too like the screen where card wwill come and user will swipe it ion right or left or easy or hard with a tinder like ui there would be a progress bar and option to bookmark the card. it would be like when user taps the card it wouldd flip revealing the ans and when the user sipter it the nexxt card would appear.
this should also support things like chemical formulas and photos on both sides addition on cards math formulas too.
and if the info is going out of carsd there should be small option to clcik to the card becomes scrollale
if all cards end the user will be promted with a congrats messge and and option to continue another bacth the batch would be of arounf 30-40 cards each depenig on backlog and fsrs and algo would decide all 

fsrs would decide and on app layer i will decide in what order shuold i show user the cards with priority queue 

we will also need a synicing process in ooder to make sure the data from watermelon db goes to supabase and supbbase can download decks when needde

at start user will be promptd to choose 3 decks in global queue the home page
and cards shown will onlyy be from 2 of the 3 when one of the two end in the congo screen after a sessiojn idc if cards end in between sesssion but after session user will be asked to add new deck or chapeter 

the new cards would keep drippinng from the new decks and the older cards would keep resufacin gin the session.

there would be a super card tooo a set of cards which as stored as one cards for knowlegede that needs more space and cant be presented in one card


now in library or cram mode --

there would be different chapter listed which the sudnet can revise(i am confused should i in clude spcaed repetition there or some other method i will not interfere it with global queue with is students will use cram mode only near ecxam wither idk how to implement it there would be 100-250 cards per chpater there shoudld be an option of mistakes that if a stduetn wants to revise only those carsd which he did not know last time i thinkk idk i neeed you input)
all the cards would have tags associalted with them the chpater the topic the difficulty or formula,expcetion,pyq as they are premade we willl fiill them 

the diifulty tag would determine the confidence quantity or something in fsrs like how much confident you want to be with the cards

if the card is tagged hard confidence=90
easy=75
medium=85
fundamental=50

right now the studejts can onnly acess teh app with refferal code so ask referal code and name 
later we will also implement a tecah er portal where teacher can see performace of student in diffeiret toipics whgo came through his refferall.

we right now are avoiding card creating and editing 

super card would alwasy come in set of carsd it would look like normal card in session just a differnt bordercolor to distinguish

later we also plan to add mcq or integer question with spaced repetion with connected topic but it is far fetched

i also want a way to see cards whille creating them shoud i build the card craetinng fucntionality too ? to see wher ethe image is loding an dhow mcuh is coming  on screen how does it look?




