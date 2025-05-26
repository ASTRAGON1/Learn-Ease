import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { XIcon } from "lucide-react";

export const LandingPage = (): JSX.Element => {
  // Navigation links data
  const navLinks = [
    { text: "Home", href: "#" },
    { text: "FAQ", href: "#" },
    { text: "About Us", href: "#" },
  ];

  // Features list data
  const features = [
    "📚 Interactive personalized learning experience",
    "🎓 Trusted and qualified special needs educators",
    "🌟 Grow with confidence and track progress",
  ];

  // Data for the cards to enable mapping
  const cards = [
    {
      id: 1,
      icon: "🎯",
      title: "Personalized Learning",
      description:
        "Each student follows a path tailored to their pace, needs, and strengths — making learning engaging and accessible.",
      highlighted: false,
    },
    {
      id: 2,
      icon: "👩",
      title: "Special Needs Experts",
      description:
        "Our teachers are trained to support kids and teens with Down Syndrome and Autism, ensuring understanding and care.",
      highlighted: true,
    },
    {
      id: 3,
      icon: "💬",
      title: "Supportive Community",
      description:
        "We collaborate with parents, caregivers, and professionals to build confidence and consistent progress for every learner.",
      highlighted: false,
    },
  ];

  // FAQ questions data for mapping
  const faqItems = [
    {
      question: "Who are the classes for?",
      answer: "",
    },
    {
      question: "Are the teachers qualified?",
      answer: "",
    },
    {
      question: "Are the classes live or recorded?",
      answer: "",
    },
    {
      question: "How do I sign up my child?",
      answer: "",
    },
    {
      question: "What devices can I use?",
      answer: "",
    },
    {
      question: "Can I see my child's progress?",
      answer: "",
    },
    {
      question: "How do I become a teacher on this platform?",
      answer: "",
    },
  ];

  // Navigation links data
  const mainLinks = ["Home", "About Us", "FAQ", "Teach on Edu", "Contact"];
  const legalLinks = ["Help Center", "Privacy Policy", "Terms & Conditions"];

  return (
    <div className="w-full">
      <div className="relative w-full bg-white">
        {/* Header */}
        <header className="w-full h-[107px] shadow-[1px_1px_22.2px_#1e1e1e] bg-white flex items-center px-[45px]">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="font-['Poppins',Helvetica] font-normal text-[#9c6fe4] text-3xl">
              Logo
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-8">
                  {navLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={link.href}
                        className="font-['Poppins',Helvetica] font-normal text-black text-base"
                      >
                        {link.text}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Become a teacher link */}
              <div className="font-['Poppins',Helvetica] font-normal text-black text-base ml-4">
                Become a teacher
              </div>

              {/* Login Button */}
              <Button
                className="w-[78px] h-[30px] rounded-[5px] border border-solid border-[#9c6fe4] bg-transparent ml-8"
              >
                <span className="font-['Poppins',Helvetica] font-normal text-black text-xs">
                  Login
                </span>
              </Button>

              {/* Sign Up Button */}
              <Button className="w-[78px] h-[30px] bg-[#4b0eac] rounded-[5px] hover:bg-[#4b0eac]/90">
                <span className="font-['Poppins',Helvetica] font-normal text-white text-xs">
                  Sign Up
                </span>
              </Button>
            </div>
          </div>
        </header>

        <div className="relative w-full">
          {/* Hero Section */}
          <section className="relative">
            <div className="relative flex flex-row justify-between px-12 py-16">
              <div className="max-w-[598px] space-y-8">
                <h1 className="text-[40px] font-normal text-black [font-family:'Gill_Sans_Ultra_Bold_Condensed-Regular',Helvetica] leading-normal">
                  Online Classes for Kids &amp; Teens with Down Syndrome
                </h1>

                <div className="space-y-4 pl-12">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="[font-family:'Poppins',Helvetica] font-normal text-black text-2xl leading-normal"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4 pl-16">
                  <Button className="w-[183px] h-[60px] bg-[#4b0eac] rounded-[30px] [font-family:'Poppins',Helvetica] font-normal text-white text-2xl shadow-[0px_4px_14.8px_#6a46a399]">
                    Get started
                  </Button>
                </div>
              </div>

              <div className="relative w-[536px] h-[443px]">
                <img
                  className="w-[520px] h-[443px] absolute top-0 left-0 object-cover"
                  alt="Image"
                  src="https://c.animaapp.com/mb422rfk1s0uIW/img/image-3.png"
                />
                <img
                  className="w-[425px] h-[221px] absolute top-32 left-[82px] object-cover"
                  alt="Image"
                  src="https://c.animaapp.com/mb422rfk1s0uIW/img/image-4.png"
                />
                <img
                  className="w-[79px] h-[79px] absolute top-[327px] left-[49px] object-cover"
                  alt="Image"
                  src="https://c.animaapp.com/mb422rfk1s0uIW/img/image-5.png"
                />
                <img
                  className="w-[60px] h-[52px] absolute top-[323px] left-[476px] object-cover"
                  alt="Image"
                  src="https://c.animaapp.com/mb422rfk1s0uIW/img/image-6.png"
                />
              </div>
            </div>

            <img
              className="w-full h-[480px] absolute top-[107px] left-0 z-[-1]"
              alt="Vector"
              src="https://c.animaapp.com/mb422rfk1s0uIW/img/vector-1.svg"
            />
          </section>

          {/* Who We Are Section */}
          <section className="w-full max-w-[1133px] mx-auto py-16">
            <header className="text-center mb-16">
              <h2 className="font-bold text-4xl text-[#4b0eac] mb-6">WHO WE ARE</h2>
              <p className="font-bold text-2xl text-black max-w-[803px] mx-auto">
                Empowering students with special needs through personalized,
                compassionate, and effective online learning.
              </p>
            </header>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className={`w-full max-w-[344px] h-[488px] bg-white ${
                    card.highlighted ? "shadow-[1px_5px_20px_10px_#00000033]" : ""
                  }`}
                >
                  <CardContent className="p-0 h-full relative">
                    <div className="w-[273px] h-3 bg-[#9c6fe499] mx-auto" />

                    <div className="px-8 pt-[105px] pb-8 flex flex-col items-center h-[calc(100%-24px)]">
                      <div className="text-6xl mb-6">{card.icon}</div>
                      <h3 className="font-bold text-2xl text-[#4b0eac] text-center mb-6 whitespace-nowrap">
                        {card.title}
                      </h3>

                      <p className="font-bold text-xl text-black text-center">
                        {card.description}
                      </p>
                    </div>

                    <div className="w-[273px] h-3 bg-[#9c6fe499] mx-auto absolute bottom-0 left-0 right-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Teacher Recruitment Section */}
          <section className="relative mt-16 text-center px-16">
            <h2 className="[font-family:'Inter',Helvetica] font-bold text-[#4b0eac] text-4xl tracking-[0] leading-normal">
              BECOME A TEACHER IN&nbsp;&nbsp;LearnEase
            </h2>

            <p className="mt-6 [font-family:'Inter',Helvetica] font-bold text-black text-2xl tracking-[-0.72px] leading-10">
              Make a difference in the lives of children with special needs.
              Join our community of dedicated educators.
            </p>

            <p className="mt-6 mx-auto max-w-[1094px] [font-family:'Inter',Helvetica] font-medium text-black text-2xl text-center tracking-[-0.72px] leading-10">
              Are you passionate about inclusive education? We&apos;re always
              looking for qualified and caring teachers to help kids with Down
              syndrome and autism thrive. Share your knowledge, inspire growth,
              and be part of an impactful journey.
            </p>

            <div className="mt-8 flex justify-center">
              <Button className="w-[210px] h-[60px] bg-[#4b0eac] rounded-[30px] [font-family:'Poppins',Helvetica] font-normal text-white text-2xl text-center shadow-[0px_4px_14.8px_#6a46a399]">
                Start Teaching
              </Button>
            </div>
          </section>

          {/* Newsletter Section */}
          <div className="w-full max-w-[995px] mx-auto my-8">
            <Card className="relative w-full h-[598px] bg-[#ffffff99] rounded-lg shadow-[-10px_-10px_30px_#ffffff7d,10px_10px_30px_#0000000d]">
              <CardContent className="p-0">
                {/* Close button */}
                <div className="absolute w-5 h-5 top-10 right-10">
                  <div className="relative h-5">
                    <XIcon className="h-5 w-5 text-[#c4c4c4]" />
                  </div>
                </div>

                {/* Left side image */}
                <img
                  className="absolute w-[388px] h-[291px] top-[98px] left-[78px]"
                  alt="Newsletter illustration"
                  src="https://c.animaapp.com/mb422rfk1s0uIW/img/group-8.png"
                />

                {/* Right side content */}
                <div className="absolute w-[386px] h-[265px] top-[105px] left-[531px]">
                  <div className="absolute w-[360px] h-[100px] top-0 left-0">
                    <div className="absolute w-[238px] h-[37px] top-0 left-0 [font-family:'Poppins',Helvetica] font-bold text-black text-xs tracking-[1.20px] leading-[normal]">
                      STAY CONNECTED WITH US
                    </div>
                  </div>

                  <div className="absolute w-[382px] h-[132px] top-[134px] left-0.5 [font-family:'Poppins',Helvetica] font-normal text-black text-[11px] tracking-[-0.11px] leading-[normal]">
                    <span className="tracking-[-0.01px]">
                      Be the first to receive updates about new features, class
                      schedules, personalized learning tips, and platform improvements
                      – straight to your inbox.{" "}
                    </span>

                    <span className="font-bold tracking-[-0.01px]">
                      Subscribe today and stay ahead!
                    </span>
                  </div>
                </div>

                {/* Email input and button */}
                <div className="absolute w-[838px] h-[49px] top-[448px] left-[78px]">
                  <div className="relative w-full h-[49px] flex">
                    <div className="relative flex-1 h-[49px] bg-[#ffffff99] rounded border-[0.5px] border-solid border-[#b6b6b6] flex items-center">
                      <div className="pl-[18px] [font-family:'Poppins',Helvetica] font-normal text-[#b6b6b6] text-[9px] tracking-[0.27px]">
                        <Input
                          className="border-none bg-transparent text-[9px] h-[29px] p-0 placeholder:text-[#b6b6b6] focus-visible:ring-0"
                          placeholder="Enter your email address"
                        />
                      </div>
                      <Button className="absolute right-0 w-[207px] h-[49px] rounded-[0px_4px_4px_0px] bg-[#ffffff99] hover:bg-[#ffffffcc]">
                        <span className="[font-family:'Poppins',Helvetica] font-bold text-[#ffffff99] text-[9px] tracking-[0.90px]">
                          NOTIFY ME
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Disclaimer text */}
                <div className="absolute w-[349px] h-[33px] top-[531px] left-[321px] [font-family:'Poppins',Helvetica] font-normal italic text-[#b6b6b6] text-[8px] text-center tracking-[-0.08px] leading-[normal]">
                  Your email is safe with us. No spam, just useful updates.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <section className="w-full max-w-[928px] mx-auto my-16">
            <div className="flex justify-center mb-12">
              <h2 className="text-7xl font-bold tracking-[-1.44px] leading-[72px] text-center bg-gradient-to-b from-white to-[#4c0fad] bg-clip-text text-transparent font-['Inter',Helvetica]">
                FAQ
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className={`bg-[#ffffff08] ${index === 0 ? "rounded-t-[12px]" : ""} ${index === faqItems.length - 1 ? "rounded-b-[12px]" : ""}`}
                >
                  <AccordionTrigger className="py-[15px] px-6 hover:no-underline">
                    <span className="font-['Inter',Helvetica] font-bold text-[#4b0eac] text-2xl tracking-[-0.72px] leading-10 text-left">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Footer */}
          <footer className="w-full py-16 bg-[#9c6fe4]">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {/* Company info section */}
                <div className="space-y-6">
                  <h2 className="font-['Inter',Helvetica] font-bold text-[#4b0eac] text-4xl">
                    LearnEase
                  </h2>
                  <p className="font-['Poppins',Helvetica] font-bold text-white text-base">
                    Empowering personalized education for every learner.
                  </p>
                  <div className="font-['Poppins',Helvetica] font-bold text-white text-base">
                    Email: support@Learnease.com
                    <br />
                    Phone: +123 456 7890
                  </div>
                </div>

                {/* Main navigation links */}
                <div className="md:col-start-3">
                  <nav>
                    <ul className="font-['Poppins',Helvetica] font-bold text-white text-base space-y-2">
                      {mainLinks.map((link, index) => (
                        <li key={index}>
                          <a href="#" className="hover:underline">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Legal links */}
                <div>
                  <nav>
                    <ul className="font-['Poppins',Helvetica] font-bold text-white text-base space-y-2">
                      {legalLinks.map((link, index) => (
                        <li key={index}>
                          <a href="#" className="hover:underline">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>

              {/* Copyright notice */}
              <div className="mt-12">
                <p className="font-['Inter',Helvetica] font-bold text-white text-xs tracking-[-0.12px] leading-[18px]">
                  © 2025 LearnEase™. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
