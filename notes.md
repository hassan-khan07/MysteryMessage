_question_ why we choose sonner for toast notification
_question_ what is optimistic ui approach
_question from 10(1:9:00)_ check debouncing method flow
_question from 14(2:00)_ in dashboard how switch button is working as form in our project

_question from 4_ : why are we not using nextAuth for signup and choose cor mongoose to save user data in database?
Because We don’t use NextAuth for signup because it’s built only for authentication, not account creation. It has a fixed and limited structure (like email/password), and doesn’t let us customize the signup logic — such as hashing passwords, adding custom fields, or verifying users. That’s why we use our own API with Mongoose for signup, and then NextAuth only for login and session handling.”

_question from 4_ : why our signup flow is different from others

_imp_-> jab bi types define hota hain most of times interface hi use hota ha (basic typescript)

_comments_
const expiryDate = new Date();
expiryDate.setHours(expiryDate.getHours() + 1); in this we set expiry date const and then we modify it why ?

it is because of new keyword like here data is object and behind object whether it is let or const and object memory ka andar refrence point ha jo ka poora area ha aur us ka andar jo values hain wo change hoti
const = you can’t change the window frame (the pointer to the house).
But you can still rearrange the furniture inside the house (the object’s internal values).

we can change the memory but not the refrence

_question from 2_ : why we use mongoose
_question from 2_ : why we use zod more and what is zod
_question from 2_ : why we write models in user.ts and also check line 75 and below and why we make schema folder
_question from 2_ : we have made schemas in models but why we make seperate folder for schemas
jab ham mongoose ka zariya schema likhta hain to wo mongodb ka lya likhta hain lakin yahan ham schemas ksi aur purpose ka lya likh rha

_why we make signup schema ts file_
mongoose ka andar poora user ka validation ha sirf signup ka dooran cheezain sahi sa aa rahi hain validate hoo ka aa rahi hain like username manga ha to username hi de rha ha ya us ki jaga 123 to nhi likh dya or special symbol to nhi daal dya.is sara verification ko check karna ka lya ham aik library use karain ga aur wo (zod) ha

_what is zod_
zod is schema validation like we make in schema folder.agr hama email valid karna ha to mongoose tk jana ki kya zarorat ha zod pehla hi check kar da ga

_imp_-> we use object schema in this

_from 6_ in next-auth.d.ts which is in types folder.there we define new data types or modify the existing one

ts ma ham directly interface likh date tha lakin agr ham packages import karta hain aur chahta hain ka poora package aware hoo jaye mare new data types sa to ham directly interface nhi kar sakta. jase ka model(user.ts) ma ham na kar dya tha ka ya mera hi code ha ksi aur ka nhi ha to is lya ham na directly interface likh ka apna kam kar dya. lakin agr ham koi next auth type la raha hain to pehla us module ko import karna para ga aur us ka andar jo module likha howa hain us ka interface sa ham changes kar sakta
_from 6_ how next auth middleware different from node and express
_from 6_ for frontend why we write on top use client and children

_from 8 (18:50)_ why we cannot serve all messages at once
_from 8 (24:00)_ why are we making alot of users
_from 10(32:40)_ why we use /api for get request in page.tsx
_from 10(58:20)_ from page.tsx(which is in signup) why we use onchange for username and not for email


_from 10_ why are we using react hook form ---->>>>>>>>  When a form has multiple fields, managing them with useState becomes messy, slow, and unoptimized because every field triggers re-renders and you manually handle validation and errors. RHF solves this by keeping the form values outside React’s state, minimizing re-renders, giving built-in validation, and letting you control the entire form through one structured system.


_from 11(1:30)_ in verify why we need to capture username in route
