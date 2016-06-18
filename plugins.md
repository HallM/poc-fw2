loading plugins:
dealing with dependencies and ordering is the hard part

thing1:a
thing1:b <- thing1:a

thing2:c <- thing1:a

when thing1:a finishes, thing1:b should not run until all others are done

thoughts:
- build a graph of dependencies
- the nodes represent a stage (plugin:action)
- the nodes contain ptrs to external things that depend on it
- the nodes also contain ptrs to internal things that depend on it
- separating external and internal, so external runs first
- a node may have multiple parents
- may actually keep the "depends on" from child to parent
- instead of the "required for" from parent to child due to the relationship

determining order of execution:
- it is important to make sure all children are exhausted before moving to self-nodes
- must have a way to determine order at build-time for production
- hoping to "block" a unit from continuing until all which depends on it can complete
- potential issue: deadlock
- the thing I am looking to provide is anything that needs to run between X:A and X:B
- but may have other dependencies can still block X:B from running
- but if that other dependency is waiting on X:B, then it would be blocked, deadlocking X:B

example: may want to block the start of the express server while loading everything

- some plugins may require immediately running after something else
- some plugins may not care, just simply run at some point after another
- so instead, lets add a @Block(plugin:event) syntax as well
- @Block adds self:self as a dependency to the other plugin:event
- @Block(plugin:*) would add self:self to any dependency which self:self does not depend on

- to determine execution order, finding the reverse order is probably the easiest
- it's easy to find things that have nothing depending on them

"eventless" nodes happen when another event depends on a non-existing event

plugin:* is a special "event" that has dependencies to all other plugin:events

### graph building ###

for each plugin, on add plugin:

1. for each event in the plugin:
    1. attach event to a node:
        - if the node exists and is "eventless", now it has one
        - if no node exists yet, create it
    2. for each @WaitOn(x:y):
        1. if x:y does not have a node yet, create an "eventless" node
        2. add a link from x:y to this event
        3. x:* is not special here, just points to that node
    3. for each @Block(x:y):
        1. if x:y does not have a node yet, create an "eventless" node
        2. add a link from this event to x:y
        3. x:* is special here.
            1. must know what x:events this remotely depends on
            2. add links from this event to all x:y this event does not depend on **in any way**
2. create the plugin:* event depending on all events for this plugin

### execution order detection algorithm ###

1. make sure all nodes/events are not "eventless", aka non-existant
2. iterate through all nodes and find ones with no outward nodes
    - if no nodes found, but nodes exist, then there's an impossible situation
3. add those found to the execution stack (stack, because FILO)
4. remove all nodes added from the graph
5. if there are nodes remaining, repeat 2-5
