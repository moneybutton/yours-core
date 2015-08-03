@aramkris's business model
=======================
Notes: 
User Experience is the Key to making this happen. 
- There are 3 Major player(s) in this P2P Network. Creator <-> Collector/Commentor/Audience <-> Connector/Share (arrow back to creator). 1 & 3 provide the value addition; 2 & 3 help in passing information and content; 3 helps in growing the network along with 1 who might be able to provide better content.
- Node: Any computer (server or a simple desktop) that hosts content and allows itself to participate in the network. Nodes provide rights to the network to store data (to the extent allowed) on the local hard drive.
	- Full Node: Allows creation, consumption and sharing of all content created everywhere in the network within its set of rules.
	- Restricted Node: Allows creation and sharing of content created by the specific node. Consumption of all content is also allowed. 
	- Simple Node: Allows consumption of content for the chosen topics. 
	- Blocking content: This type of content is blocked from being accessed from a node. Other node(s) can still allow this content. 
	- Reject content: The type of content is rejected by a node and will not be hosted by it. 
	(Difference between Blocking and Rejection: For example, content which involves information on politics can be accepted by a node, but specific comments which follow that might not meet the rules 		required. So, these comments can be blocked by a node. However, the original content is still available. In case of rejection of content, the node will not host anything on that specific topic(s).)
- Information cache: Information stored locally by the application. The information present when the application exited will be stored as it would provide better context to the network with the application comes online.
- Content: Any information (article, link, media etc) that is submitted to the network. The person submitting this information is the creator.
- Comment: Subsequent information added to submitted content by a user different from the creator.
- Additional information: Additions or updation of the original content submitted by the creator. This will update the original post. (Still thinking about this as if we lock the post with a hash, then changes would lead to violations) <End of Notes>

#### Protocol
  - Needs to be minimal
  - Good & consistent sync of comments, votes and content apart from information on moderation etc while assuming that packet losses in the network are inevitable. Bittorrent P2P network like reliability.
  - Manage bandwidth efficiently
  - Node discovery should be easy"
  - How to find other nodes?
  - Auto propagation should be possible within the realm of what the node allows
  - Should fundamentally integrate sharing with bitcoin when accessing content

#### Application (Mobile, Web) - Functionally

  - Connect to the P2P network
  - Download the list of topics of interest
  - Store the content locally (as desired)
    - Maybe there can be options to do this inside and outside the app with and without payment
  - Integrate with other social media apps
    "Have the ability to share with twitter, facebook etc."
  - Ability to vote
  - Ability to read comments inline in the app itself
    "I feel this is a difficult problem to solve as the current method of reading comments is terrible. Either we lose perspective of the comments when someone has provided a specific answer or we lose context of the main content."
  - Needs to integrate with
    - Reference/Academic sites (arxiv or academia or even the Alexandria project)
      - The Alexandria project would be good to have as good content available on Alexandria can be made available to a larger audience thru' this mechanism
    - Bitcoin network
  - Web App
    "Needs to be thought through as the keys need to be shared or at least authentication of a mobile app needs to be shared with a cloud based application"
    - Minimal cloud based solution should be available
  - Moderator Setting: Can it have the ability to deny access to specific node(s) or specific user(s)?
  - Maybe the application can also provide an option to get information from a different full node 
    - Have a simple file where users can add information on full nodes manually, if required.
  - The application can also provide the content owner information on which full node is hosting his/her content.
  - It might be a good idea if we can let content owners know how many times the content has been downloaded. (??)
  - Moderation
    "Ultimate power should rest with the hosting node."
    - Allow competitive moderation? 
      - Nodes can get to choose who can be the moderators. So, if someone feels that nodes are refusing to host their content, then they can host a node and become the moderator.
    - Users can also choose moderators for specific articles/boards/subs, if possible

#### Node(s)

  "By default all nodes start as Restricted nodes.
  The node should be able to decide what to sync (type of content), when to sync, How much to sync, user level sync etc.
  Country specific sync would not be possible in this setup unless the P2P network posts get banned."
  - Full Hosting nodes
    "Read and Write client which also hosts information from others"
    - The network pays this node for hosting content
    - Block and Reject content
    - Keeps a local copy of all information
  - Restricted nodes
    "Read and Write client"
    - Gets paid a smaller amount for content creation
    - Can Block content for content created by the node
  - Simple nodes
    "Read Only client"
    - Only content consumption
    - Can neither block nor reject content; Will get the content provided by the full or restricted node to the extent it subscribes
    - Don't get paid

#### Manage content

  - Reward content
    - For creation
    - Comments which are upvoted beyond a certain point (This can be from the creator itself, if the creator feels the comment is valuable)
    - Pointing out mistakes (creator can step in)
    - Additional posting to the article which leads to better value
    - With subsequent posts linking to this the value of this post can increase (like Google's algorithm)
  - At this moment I would assume that anything other than child por* and terrorism promoting stuff should be allowed.

#### User?

  "Who is an user? There needs to be an authentication/registration mechanism wherein all the users are identified (if they want). This information need not be publically available and can be maintained in the blockchain."
  - Keeps hold of the same private key
  - Authenticated in the blockchain by usage of a private key so that if they have a username, they can keep it
    - This would come in handy for academic institutions and also for people who want to contribute and own content. Anonymity would not help if we are rewarding content.
  - Payments are received thru' the public key. the username can link to the public key.
  - Rating & reputation
    - Needs to be managed at a node and network level. This needs to be part of the protocol to sync.
    - Need to be discussed. 
      - Needs to be statistically managed
      - Use the blockchain to track any posts by the user (or think of something that can be left on the blockchain to check)

#### Revenue
(In addition to hosting revenue that a node will generate and what the creator makes)
  - Usage as a corporate Intranet
    "Use this network inside the company and let people subscribe to information. This can provide flexibility to people as not all information will be flashed when someone comes online. "
    - Secure board(s)/pages
    - easier discussions
    - Possibly use the space in the user hard drives which are terribly under used in today's corporate environment

#### Problem at this moment

  - Corporate interest wants to restrict content sharing and also dissemination of content against their policies(?) and interests
  - One point of failure and success
  - Do content owners get rewarded? For example, if someone posts a link to a paper or an article, the content owner may not even know.

#### Problem to be addressed

  - Balance between monetization of content and user freedom
  - Creators of content to get rewarded better
  - Why now?
    - Decentralization as a theme is picking up now as Byzantine generals problem and sybil attacks can be handled
    - General dissatisfaction with censorship and moderation at community sites
    - Opportunity to build something that will be ubiquitous like Bitcoin on top of the blockchain and value does not leave the blockchain
    - Social trend: People are looking for applications on top of the Blockchain and would be more willing to experiment. 
    - Financial trend: Bitcoin is currently at a market value of USD 4Bn. These applications can increase the value of the network as the content quality which can be used with the blockchain as the backbone can increase. This should lead to more usage and higher value of the network itself.

#### Application - Operationally

  - Connect to a P2P network (PK is known)
    - Clients can use the list of known nodes to come back online to the network. Or use DNS seeds or use IRC server(s). This will be very similar to what bitcoin clients do. (addrman)
  - Download topics that are being followed
  - View the topics and articles added to the topics
    - Add comments or vote on the articles
    - View comments
    - View votes (might not have much of an impact if this

#### Steps

  - Create the application which will enable creation & sharing of content 1:1 (more like P2P network)
  - Application should have the ability to let other users join the conversation
    - Boards should be present
    - Moderation comes into picture here
  - Voting 
  - Rating/Reputation management system
