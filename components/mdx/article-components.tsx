import type { ComponentProps } from 'react'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider,
  BodyImage,
} from './MdxComponents'
import { FaqList, FaqItem } from '@/components/article/Faq'
import { SizeTable, SizeRow } from '@/components/article/SizeTable'
import { WhatToDo, Step } from '@/components/article/WhatToDo'
import { PoisonCenters } from '@/components/article/PoisonCenters'
import { BrandCTA } from '@/components/marques/BrandCTA'
import { Heading2 } from './Heading2'

// Composants utilisables dans les articles MDX (content/blog), pour /chien/[category]/[slug]
// et /blog/[slug]. Un composant absent de cette liste fait échouer la compilation de l'article.
export const articleMdxComponents = {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider,
  FaqList, FaqItem,
  SizeTable, SizeRow,
  WhatToDo, Step,
  PoisonCenters,
  BrandCTA,
  BodyImage,
  h2: Heading2,
  table: (props: ComponentProps<'table'>) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
}
