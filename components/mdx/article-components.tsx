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
import { BreedBrandCompare, BrandGroup, BrandRow } from '@/components/race/BreedBrandCompare'
import { ArticleSignupInvite } from '@/components/cro/ArticleSignupInvite'
import { ToolCta } from '@/components/article/ToolCta'
import { SitterSheetCta } from '@/components/garde/SitterSheetCta'
import { Heading2 } from './Heading2'
import { MdxLink } from './MdxLink'

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
  BreedBrandCompare, BrandGroup, BrandRow,
  BodyImage,
  ArticleSignupInvite,
  ToolCta,
  SitterSheetCta,
  h2: Heading2,
  a: MdxLink,
  table: (props: ComponentProps<'table'>) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
}
