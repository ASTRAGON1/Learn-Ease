import React, { useState } from 'react';
import './CurriculumSection.css';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem }       from '@mui/x-tree-view/TreeItem';


const curriculumData = [
  {
    key: 'autism',
    title: 'General path for Autism students',
    items: [
      { label: 'Listening Skills',
        subsections: [
            {
              title: 'Listening 1 – Understanding Emotions',
              lessons: [
                'Lesson 1 – Identifying Happy and Sad',
                'Lesson 2 – Recognizing Angry and Calm Faces',
                'Lesson 3 – Matching Emotions to Situations',
                'Lesson 4 – Facial Expressions Practice',
                'Lesson 5 – Responding to Emotions in Others',
              ],
            },
            { title: 'Listening 2 – Asking for Help' },
            { title: 'Listening 3 – Expressing Needs' },
            { title: 'Listening 4 – Listening and Responding' },
            { title: 'Listening 5 – Daily Conversations' },
          ],
      },
      {
        label: 'Speaking & Communication',
        subsections: [
          {
            title: 'Communication 1 – Understanding Emotions',
            lessons: [
              'Lesson 1 – Identifying Happy and Sad',
              'Lesson 2 – Recognizing Angry and Calm Faces',
              'Lesson 3 – Matching Emotions to Situations',
              'Lesson 4 – Facial Expressions Practice',
              'Lesson 5 – Responding to Emotions in Others',
            ],
          },
          { title: 'Communication 2 – Asking for Help' },
          { title: 'Communication 3 – Expressing Needs' },
          { title: 'Communication 4 – Listening and Responding' },
          { title: 'Communication 5 – Daily Conversations' },
        ],
      },
      { label: 'Reading Comprehension' },
      { label: 'Writing Practice' },
      { label: 'Math Basics' },
      { label: 'Daily Life Skills' },
      { label: 'Social Interaction' },
      { label: 'Emotional Recognition & Expression' },
    ],
  },
  {
    key: 'down',
    title: 'General path for Down syndrome students',
    items: [
      { label: 'Basic Communication Skills' },
      { label: 'Reading and Phonics' },
      { label: 'Writing and Drawing' },
      { label: 'Number Recognition & Counting' },
      { label: 'Personal Hygiene and Self-care' },
      { label: 'Daily Routines & Independence' },
      { label: 'Emotional Understanding' },
      { label: 'Social Skills and Group Activities' },
    ],
  },
];

export default function CurriculumSection() {
  const [activeSectionKey, setActiveSectionKey] = useState('autism');
  const [activeIndex, setActiveIndex] = useState(0);

  const section = curriculumData.find((s) => s.key === activeSectionKey);

  return (
    <div className="curr-section">
      {/* toggle between the two paths */}
      <div className="curr-switcher">
        {curriculumData.map((s) => (
          <button
            key={s.key}
            className={`curr-switch-btn ${
              s.key === activeSectionKey ? 'active' : ''
            }`}
            onClick={() => {
              setActiveSectionKey(s.key);
              setActiveIndex(0);
            }}
          >
            {s.key === 'autism' ? 'Autism path' : 'Down syndrome path'}
          </button>
        ))}
      </div>

      <h3 className="curr-title">{section.title}</h3>

      {/* timeline */}
      <div className="curr-labels">
            {section.items.map((it, i) => (
            <div key={i} className="curr-label">{it.label}</div>
            ))}
        </div>
      <div className="curr-timeline">
        {section.items.map((it, i) => (
          <div
            key={i}
            className={`curr-point ${activeIndex === i ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <div className="curr-circle" />
          </div>
        ))}
        
        </div>

        {activeIndex !== null && section.items[activeIndex].subsections && (
        <Box className="curr-details" sx={{ minWidth: 550 }}>
            <SimpleTreeView>
            {section.items[activeIndex].subsections.map((sub, j) => (
                <TreeItem key={j} itemId={`sub-${j}`} label={sub.title}>
                {sub.lessons?.map((lesson, k) => (
                    <TreeItem
                        key={k}
                        itemId={`les-${j}-${k}`}
                        label={lesson}
                        className="curr-lesson-item"
                    />
                    ))}

                </TreeItem>
            ))}
            </SimpleTreeView>
        </Box>
        )}

    </div>
  );
}
