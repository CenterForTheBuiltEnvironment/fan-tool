# calculate the increase in temperature possible when increasing air speed
# and maintaining the same SET (starting at standard conditions)
# fit a simple model to the data
#

library(comf)
library(tidyverse)

# set the gplot theme
theme_set(theme_light())

strd <- createCond()
strd_ta = strd$ta

strd_set = calcComfInd(strd,request="all")$set

vels <- seq(from=0.1, to=5, by=0.01)

df = data.frame(vel_mps = strd$vel, delta_ta_c = 0, set = strd_set, ta = strd$ta, tr= strd$tr)
for (v in vels) {
  cond <- createCond()
  cond$vel = v
  set = calcComfInd(cond, request="set")$set
  while (abs(strd_set-set)>0.01){
    guess_delta = (strd_set-set)/2 
    cond$ta = cond$ta + guess_delta
    cond$tr = cond$tr + guess_delta
    set = calcComfInd(cond, request="set")$set
  }
  r = data.frame(vel_mps = v, delta_ta_c = cond$ta - strd_ta, set = set, ta = cond$ta, tr= cond$tr)
  df = rbind(df,r)
}

eqn_data = df%>%filter(delta_ta_c>0)
ggplot(eqn_data, aes(x=vel_mps, y=delta_ta_c)) + 
  geom_point() +
  geom_smooth(method= lm,formula = y ~ log(x), se=TRUE) +
  scale_x_continuous(expand=c(0,0), "Air speed (m/s) | (above, fpm)", sec.axis = sec_axis(~ . * 197)) +
  scale_y_continuous(expand=c(0,0), "Temperature difference (C) | (right, F)", sec.axis = sec_axis(~ . * 1.8 + 32))
fit = lm(eqn_data$delta_ta_c~log(eqn_data$vel_mps))  
summary(fit)


# fit for a smaller range of airspeeds (up to 2 m/s)
eqn_data = df%>%filter(delta_ta_c>0)%>%filter(vel_mps<=2)
ggplot(eqn_data, aes(x=vel_mps, y=delta_ta_c)) + 
  geom_point() +
  geom_smooth(method= lm, formula = y ~ log(x), se=TRUE) +
  scale_x_continuous(expand=c(0,0), "Air speed (m/s) | (above, fpm)", sec.axis = sec_axis(~ . * 197)) +
  scale_y_continuous(expand=c(0,0), "Temperature difference (C) | (right, F)", sec.axis = sec_axis(~ . * 1.8 + 32))
fit = lm(eqn_data$delta_ta_c~log(eqn_data$vel_mps))  
summary(fit)
plot(fit)


