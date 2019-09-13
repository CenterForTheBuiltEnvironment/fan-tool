# This script estimates the approximate location of the maximum airspeed for fans of different diameters, in the absence of any information about the blade geometry.
# 
# It uses the data from the laboratory tested used to develop the tool
# described in this paper:
# https://escholarship.org/uc/item/4p479663
# 
# The supplementary material to this paper contains the underlying data and analysis scripts. In this script, the dataframe 'df' is the same
# as that defined in 'Manuscript.Rmd' at the end of the 'preprocess_data' chunk.

locations_of_maxes = df%>%
  filter(Z_fact == "Seat" | Z_fact == "Stand")%>%
  filter(Direction =="Down")%>% 
  group_by(IDSI, Z_fact)%>% 
  top_n(1, SO)
ggplot(locations_of_maxes, aes(x=D, y=xd)) + geom_point()  + geom_smooth(method="lm", se=TRUE)
fit = lm(locations_of_maxes$xd~locations_of_maxes$D)  
summary(fit)

# confirm location of min measurement is effectively always that just outside the wall flow
# (measurement that is 1.5 ft away from the wall, not the one that is 6 in from the wall)
#locations_of_mins = df%>%
#  filter(Z_fact == "Seat" | Z_fact == "Stand")%>%
#  filter(Direction =="Up")%>% 
#  group_by(IDSI, Z_fact)%>% 
#  top_n(-1, SO)
#ggplot(locations_of_mins, aes(x=D, y=X)) + geom_point(aes(color=as.factor(D))) + facet_wrap(R ~ Z_fact) + geom_smooth(method="lm", se=TRUE)
