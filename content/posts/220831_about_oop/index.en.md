+++
title = 'Understanding Object-Oriented and Procedural Programming'
date = '2022-08-31T20:02:58+09:00'
description = "Comparing the differences, pros and cons of OOP and Procedural Programming"
summary = "Learn about the concepts, differences, and advantages/disadvantages of Object-Oriented Programming and Procedural Programming, and understand when to use each approach."
categories = ["Programming"]
tags = ["OOP", "Procedural Programming", "Programming Paradigm"]
series = ["Programming Basics"]
series_order = 1

draft = false
+++

## Object-Oriented Programming (OOP) vs Procedural Programming (PP)

Object-oriented languages and procedural languages are **not opposing concepts**. So what exactly are object-oriented and procedural languages?

We typically refer to languages like Java, Python, and C# as object-oriented languages, while C is called a procedural language. However, this merely indicates what these languages **orient toward** - it doesn't mean C can only do procedural programming or that Java and Python can only do object-oriented programming.

> Regardless of which language you use, you can write procedural code. Conversely, you can write object-oriented code even in C.

---

## The Misconception of "Procedural-Oriented"

In fact, calling something a **procedural-oriented language** is incorrect. All programming languages are based on procedures, so saying they "orient toward" procedures doesn't make sense.

To use an analogy:
- It's like saying weightlifting is a sport that **orients toward** barbells, when in reality it's a sport **based on** using barbells.
- Should we do weightlifting with dumbbells instead...?

In other words, the correct term is **'Procedural Programming'**, not **'Procedural-Oriented'**.

{{< alert "lightbulb" >}}
Object-Oriented Programming (OOP) and Procedural Programming (PP) simply represent **different approaches** to programming - they are not opposing concepts!
{{< /alert >}}

### Key Differences

- **Procedural Programming**: Creates functions centered around data
- **Object-Oriented Programming**: Bundles data and functions (behaviors) together into objects

---

## Criteria for Distinguishing Procedural and Object-Oriented Languages

There are various ways to distinguish them, but broadly speaking, they can be categorized as follows:

1. Does it support encapsulation, polymorphism, and class inheritance?
2. Can it restrict data access?

Generally, languages that satisfy these criteria are considered to have **stronger object-oriented characteristics**.

---

## Procedural Programming

Procedural programming literally means structuring code **procedurally**.

It's an approach where you identify the sequence of data operations and create functions for necessary features, executing them procedurally (in order).

---

## Object-Oriented Programming

Object-oriented programming bundles functionalities into **objects**.

In other words, you create individual objects, each bundling the behaviors (functions) and data they can handle.

### Example

Imagine implementing a ride-hailing service:

- **Car Object**: Bundles all the behaviors (functions) a car can perform
- **Driver Object**: Bundles all the behaviors a driver can perform
- **Passenger Object**: Bundles all the behaviors a passenger can perform

The algorithm is constructed through interactions between these objects by calling their methods and fields.

---

## So Which Approach is Better?

{{< alert "circle-info" >}}
There's no definitive answer. Use what fits your needs and your preferred style.
{{< /alert >}}

### Programming in the Past

In the past, we didn't need hardware and software on the scale we do today. Old languages like **C, Fortran, and COBOL** - representative procedural languages - were widely used.

### Modern Programming

As we entered the modern era, software development accelerated and code became increasingly complex.

This led to tangled algorithms, and code became difficult or impossible for humans to understand - resulting in **spaghetti code**.

**Object-oriented programming** emerged as an alternative to address these issues.

---

## Why is Object-Oriented Programming Dominant?

Currently, object-oriented programming is predominantly used. The reasons are:

- For complex programs, using procedural programming makes code **more prone to tangling**
- In terms of scalability, it offers **fewer advantages for maintenance**

---

## Pros and Cons of Procedural Programming

### Pros

- Program directly without creating objects or classes
- Create functions for needed features to call and reuse instead of copy-pasting
- Easy to trace program flow

### Cons

- Difficult to modify due to tight coupling between code sections (high cohesion makes additions and modifications difficult)
- Difficult to debug (error checking)

---

## Pros and Cons of Object-Oriented Programming

### Pros

- Easier maintenance through modularization and encapsulation
- Code is easier to understand due to similarity with the real world
- Objects themselves are self-contained programs that can be reused in other programs

### Cons

- Most object-oriented programs tend to be relatively slower and use more memory
- Requires significant time in the design phase to make code understandable through real-world analogies

---

## There's No Right Answer! Use the Right Tool for the Job

### When to Use Procedural Programming

Typically used when the project scope is small and there's little need for code reuse.

**Benefits:**
- The program itself is lighter
- Requires less development time and personnel compared to object-oriented approach

### When to Use Object-Oriented Programming

For large-scale projects where code needs to be reused, object-oriented programming is suitable (excluding initial development costs).

**Benefits:**
- More stable from a maintenance perspective

---

## Conclusion

{{< alert "triangle-exclamation" >}}
Today we explored object-oriented programming and procedural programming.
While I don't yet have deep knowledge of these topics, by researching various sources, I've gained a broad understanding of object-oriented and procedural programming. Next time, I'll dive deeper into these concepts!
{{< /alert >}}
