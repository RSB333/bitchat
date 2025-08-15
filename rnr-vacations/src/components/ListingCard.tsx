import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function ListingCard({ item }){
  return (
    <Card className="rounded-2xl overflow-hidden hover:shadow-lg">
      <img src={item.hero_image_url} alt={item.name} className="h-48 w-full object-cover"/>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">{item.name}</CardTitle>
        <div className="text-sm flex items-center gap-1 opacity-70"><MapPin className="h-3 w-3"/>{item.city}, {item.country}</div>
      </CardHeader>
      <CardContent className="pt-0 text-sm flex items-center gap-2">
        <Star className="h-4 w-4"/><span>{item.rating ?? '—'}</span>
        <Badge className="ml-auto rounded-2xl">{item.type}</Badge>
        <Link to={`/listing/${item.id}`} className="ml-auto underline">View</Link>
      </CardContent>
    </Card>
  );
}