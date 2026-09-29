+++
title = 'Weekly Reflection: Finding My Design Criteria Through DDD'
date = '2026-05-24T08:48:38+09:00'
description = "Reflections on studying DDD and putting domain design into practice."
summary = ""
categories = ["Retrospective"]
tags = []
series = ["Retrospective"]
series_order = 1

draft = false
+++

## Finding my design criteria through DDD

This week, I studied DDD, wrote up what I learned, and used a scenario document to define the requirements and design scope for the product, brand, like, and order domains. I organized the functional requirements from both user and administrator perspectives, then created sequence diagrams, class diagrams, and an ERD to make each domain's responsibilities and relationships explicit.

The decision I spent the most time on was whether product and inventory should belong to the same domain or whether inventory should be separate. Under the current requirements, creating an order checks product stock. If enough stock is available, the order succeeds and stock is deducted immediately. Otherwise, the order fails. Policies for preorders or inventory across multiple warehouses hadn't been defined yet.

To stay focused on the policies we actually had, I chose to let the product hold its own stock quantity. This was the simplest way to express the current requirements, and it fit the order creation flow naturally. I also recognized that more complex inventory policies could give `Product` too many responsibilities. If that happens, separating inventory into its own domain would be worth revisiting.

My mentor's review helped me feel more confident about that decision. A design that needs to be split later isn't necessarily a failed design; that can be a natural consequence of a growing business. What matters is keeping today's responsibilities clearly grouped together, rather than trying to account for every possible future. Scattered responsibilities are hard to separate later. Responsibilities kept together can be moved when the need becomes clear.

Studying DDD and working through these decisions taught me how much it matters to explain what I chose under the current requirements and why. Instead of asking why option A is right and option B is wrong, I found it more useful to consider how the two differ and what trade-offs each introduces. That feels like a better starting point for design.
