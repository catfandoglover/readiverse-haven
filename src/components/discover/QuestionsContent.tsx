import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel } from "keen-slider/react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  question: string;
  illustration: string;
}

const QuestionsContent = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("great_questions")
        .select("*");

      if (error) {
        console.error("Error fetching questions:", error);
      }

      if (data) {
        setQuestions(data as Question[]);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionClick = (question: Question) => {
    navigate(`/view/question/${question.id}`);
  };

  return (
    <div className="keen-slider h-full w-full relative" ref={sliderRef}>
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="keen-slider__slide number-slide h-full w-full flex items-center justify-center p-4 cursor-pointer"
          onClick={() => handleQuestionClick(question)}
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md">
              <img
                src={question.illustration}
                alt={question.question}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{question.question}</h2>
            </div>
          </div>
        </div>
      ))}
      {loaded && instanceRef.current && (
        <>
          <ArrowLeft
            onClick={(e: any) => {
              e.stopPropagation();
              instanceRef.current?.prev();
            }}
            disabled={currentSlide === 0}
          />

          <ArrowRight
            onClick={(e: any) => {
              e.stopPropagation();
              instanceRef.current?.next();
            }}
            disabled={
              currentSlide ===
              instanceRef.current.track.details.slides.length - 1
            }
          />
        </>
      )}
    </div>
  );
};

function ArrowLeft(props: {
  disabled: boolean;
  onClick: (e: any) => void;
}) {
  const disabled = props.disabled ? "opacity-50 pointer-events-none" : "";
  return (
    <button
      onClick={props.onClick}
      className={`arrow arrow-left ${disabled}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M5 12l14 0"></path>
        <path d="M5 12l6 6"></path>
        <path d="M5 12l6 -6"></path>
      </svg>
    </button>
  );
}

function ArrowRight(props: {
  disabled: boolean;
  onClick: (e: any) => void;
}) {
  const disabled = props.disabled ? "opacity-50 pointer-events-none" : "";
  return (
    <button
      onClick={props.onClick}
      className={`arrow arrow-right ${disabled}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M5 12l14 0"></path>
        <path d="M13 18l6 -6"></path>
        <path d="M13 6l6 6"></path>
      </svg>
    </button>
  );
}

export default QuestionsContent;
