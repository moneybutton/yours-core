**How Payment(s) will
work in datt – First prototype**

Note: 

-      
For simplicity sake I am leaving out possible
payments to the datt network itself and all payment transactions are between users,
creators, moderators and Nodes. Users, creator and moderator can be the same
entity and the proposal will still hold good.

-      
The exact numbers in the transactions are not
mentioned in this document.

The typical payment network in datt is

**Scenario 1: Upvoting/Upvoting
Comments**

**Flow:** User – Node
– Moderator – Content creator

**Scenario 2: Access
content from a Node**

**Flow:** User – Node

**Scenario 3: Access
content specific to a community**

**Flow:** User – Node
- Moderator – Content creator

All the scenarios hold well even if the content creator and
moderator are played by the same entity. 

_The best solution
would be to implement duplex micropayment channels for this as a single channel_

-      
_Can handle
payment going both ways_

-      
_Can handle
intermediate payments even if one party does not have funds in their onward
channel while having funds in the reverse channel (Something like X and Y start
off with 1 BTC and X has paid Y 1 BTC while Y has paid X only 0.5 BTC. Now, if
X needs to pay Y again, it has to open another channel in the normal scenario.
In the duplex micropayment scenario, as Y needs to pay X 0.5 BTC X can use this
amount to start paying Y again. Channel resets can happen in real time)_

-      
_Number of
times that the transactions need to be written to the Blockchain can be reduced
as only channel closures need to be reflected_

-      
_(Please
note that there needs to be a minimal amount of BTC present to open a channel)_

_However, a lot of
discussion on the micropayment channels is still in discussion. (Duplex
Micropayments and Lightning)_

**For the first
prototype, I would like to suggest usage of “Simple Micropayment Channels” for
both direction(s).**

**_From the Duplex Micropayments Paper by Christian Decker_**

“Once a micropayment
channel is established, the sender can send incremental micropayments to the
receiver. The channel has a limit determined by the sender upon the channel’s
creation. Once the limit is consumed, i.e., transferred entirely to the
receiver, the channel is closed.” (Section 3.4)

 

Consider the scenarios
described above

-      
All scenarios need payment(s) that are almost
unidirectional 

o   Refunds
can be handled and I will address that later

-      
The payment originator is the user and the top
of the chain is the content creator

o   The
content creator might also in cases pay the node for privileged hosting rights.
But, apart from this scenario all other scenarios require the user to initiate
payment.

-      
Other possible models to generate revenue in
terms of sponsored content or branding will involve payment form outside the
network (typically). If the payment is happening from inside the network, then
these can be treated like content creators paying Nodes for hosting content and
the cycle continues.

 

**To address all these scenarios the creation of 2 unidirectional
channels might work for the prototype.**
(I am saying 'might' work as I am still trying to ascertain if this would work for all scenarios).

** **

**PayOUT channel(s) (One channel per user connection):**

-      
**User – Node**

-      
**Moderator – Node**

-      
**Content
creator - Node**

**PayIN channel (One channel per user connection):**

-      
**Node – Content creator**

-      
**Node - Moderator**

-      
**Node – User**

 

PayOUT is used for payment from user (content creator or Moderator)
to Node and then it gets distributed to either moderator or creator in the PayIN
channel set-up by the user/moderator/creator.

 

PayIN channels are used when the payment happens to go to the User/Content
Creator/Moderator from the Node.

 

**Proposal**

 

Assuming that the user’s access charges per week is 0.01 BTC, we can
propose that the channel be started with 0.015 BTC, to take payment for
upvoting and access to new communities, in the account. 

 

-      
When
a user (or content creator or moderator) starts the application, (this can be
done weekly with something like 0.015BTC) 2 channels get created with the Node.

o   First channel is for payment from user to
node (**PayOUT**)

o   Second channel is for payment from node
to user (**PayIN**)

o   (This happens for every user. The
channels get committed to the Blockchain every week) 

 

How will the channels be used

-      
During
a upvote:

o   User uses the PayOUT channel to pay to
the node and it further uses the PayIN channel with the Moderator and content
creator to distribute it further. 

-      
For
access:

o   The user pays the node thru’ the PayOUT
channel. 

 

**Refund(s):**

-      
This
can be managed thru’ the PayIN channels, if a transaction has to happen when
there is no currently valid transaction. Or else it can be managed as part of
the micropayment transaction itself. The micropayment transaction has 2 outputs
which are signed by the originator with the values which go to the receiver and
value which is kept with the originator. If the receiver commits a transaction
to the Blockchain then the originator receives the remaining amount directly.
For example, if X which has opened a channel with a Node for subscription for a
week decides to cancel after the 4

th day, then the node can commit
the last transaction sent by X and get the amount for the first 4 days’ and the
amount for the last 3 days’ gets sent back to X as the 2

nd output.

 

(Please note that the moderator can also pay the content creator, if
required based on the arrangement. It can be facilitated thru’ the node or a
channel can be opened between them directly.)

 

**Asssumption:**

-       No or minimal
transaction between end nodes. There is no direct monetary transfer between the
end nodes. The scheme doesn’t change if transactions have to happen without the
nodes, but the number of channels that need to be maintained become higher and
there will be more blockchain transactions to commit.

 

**Disadvantage
of this approach:**

-       We will be
creating an extra channel per connection in the system. This will mean that
there will be 2 extra transactions added to the blockchain. In effect, for the
diagram above there will be 6 extra transactions added to the blockchain. 

-       The node
assumes extra importance here as I am trying to route everything thru’ it. In
theory, it does not matter but for a direct connection between all the parties
involved there will need to be lot more blockchain transactions. In the above
scenario, if the user, moderator and creator are connected to each other
directly, then there would be 12 more transactions going to the blockchain. 

 

**Advantage:**

-       Will be simpler
to implement as the transactions are normal blockchain transactions. 

-       We will not be
adding a lot of transactions to the blockchain in the initial phase. Also, the
time for committing to the blockchain can be adjusted by keeping the channels
open for longer.

[payment-channels.docx](https://docs.google.com/document/d/1p5tUKLTft73Cvx-OKfT8Kllcwd1iJAaCtOTNYdCx11w/edit?usp=sharing)
