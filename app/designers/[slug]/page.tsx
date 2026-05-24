import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BrandPageClient from './BrandPageClient'

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!brand) notFound()

  return <BrandPageClient brand={brand} />
}
